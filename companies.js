#!/usr/bin/env node --harmony_destructuring
const request = require('request')
const colors = require('chalk')
const csv = require('csv-parser')

const {companiesSheet} = require('./secrets')

const nameQuestion = 'What is the name of your company?'

const main = () => {
  const args = process.argv.slice(2)
  const shouldFilter = args.length > 0
  const filterName = shouldFilter ? args.join(' ') : null

  const companies = request(companiesSheet)
  const csvParser = csv({ separator: '\t' })
  companies.pipe(csvParser).on('data', row => {
    const name = row[nameQuestion]
    if (shouldFilter && name != filterName) return

    console.log(colors.blue.bold(name))
    console.log()
    for (var question in row) {
      if (question == nameQuestion) break
      console.log(colors.green.bold(question))
      console.log(row[question])
    }
    console.log()
    console.log()
  })
}

main()
