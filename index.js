#!/usr/bin/env node
const inquirer = require('inquirer')
const exec = require('child_process').execSync
const chalk = require('chalk')


var date = new Date()
var year = date.getFullYear()
var month = (date.getMonth() + 1) >= 10 ? (date.getMonth() + 1) : '0' + (date.getMonth() + 1)
var day = date.getDate() >= 10 ? date.getDate() : '0' + date.getDate()

var branchArr = exec('git branch', {
    encoding: 'utf8'
}).split('\n')

var branch = branchArr.filter(item => {
    return item.indexOf('*') > -1
})[0]
var branchName = branch.slice(2)
console.log('年月日：', `${year}-${month}-${day}`)
console.log('当前分支：', branchName)

// 删除本地tag 同时拉取远端库的tag信息 避免冲突
exec('git tag -l | xargs git tag -d', {
    encoding: 'utf8'
})

var remoteArr = exec('git remote', {
    encoding: 'utf8'
}).split('\n')
var remote = 'origin'
const promptList = [{
    type: 'list',
    message: '请选择推送tag 目标库:',
    name: 'tagTarget',
    choices: 0 < remoteArr.length ? remoteArr : ['无目标选项'],
    filter: function (val) {
        return val
    }
}]

console.log('远端仓库名称为：', remote)
inquirer.prompt(promptList).then(answers => {
    if ('无目标选项' === answers.tagTarget) return console.log(chalk.red('仓库源没有找到 请使用 git remote -v 寻找问题！'))
    remote = answers.tagTarget
    exec(`git fetch ${remote} --prune`, {
        encoding: 'utf8'
    })
    // 获取全部tag 判断当天是否已经打过tag
    var allTags = exec('git tag', {
        encoding: 'utf8'
    }).split('\n')
    var todayTags = allTags.filter(item => {
        return item.indexOf(`v.${year}_${month}_${day}_${branchName}`) > -1
    })
    var tagIndex = 1
    if (todayTags.length > 0) {
        tagIndex = todayTags.length + 1
    }
    var tagName = `v.${year}_${month}_${day}_${branchName}_v${tagIndex}`
    exec(`git tag -a ${tagName} -m "脚本添加${year}-${month}-${day} ${branchName}分支 第${tagIndex}次 tag信息"`, {
        encoding: 'utf8'
    })
    console.log('(๑•̀ㅂ•́)و✧ 新增tag名称：', tagName)
    exec(`git push ${remote} ${tagName}`)
    console.log(chalk.green('(๑•̀ㅂ•́)و✧ tag上传远端库成功 tag名称为：', tagName))
})