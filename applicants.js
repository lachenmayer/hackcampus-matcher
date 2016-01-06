#!/usr/bin/env node --harmony_destructuring
const request = require('request')
const colors = require('chalk')
const csv = require('csv-parser')

const {applicantsSheet} = require('./secrets')
const matchStudent = require('./lib/matchStudent')

// no arguments: print all student matches
// student name as argument: print only that student
const main = () => {
  const args = process.argv.slice(2)
  const shouldFilter = args.length > 0
  const filterName = shouldFilter ? args.join(' ') : null

  const applicants = request(applicantsSheet)
  const csvParser = csv({ separator: '\t' })
  applicants.pipe(csvParser).on('data', row => {
    const name = row['Your name']
    if (shouldFilter && name != filterName) return
    const techPreferences = row['Tech stack/expertise'].split(', ')
    const companyPreferences = [row['1st company choice'], row['2nd company choice'], row['3rd company choice']].filter(co => co != 'No particular preference')
    const {allMatches, perfectMatches} = matchStudent(techPreferences, companyPreferences)
    logStudent(name, allMatches, perfectMatches)
  })
}

const logStudent = (name, allMatches, perfectMatches) => {
  console.log(colors.blue.bold(name))
  console.log()

  const logMatch = ([company, techOverlap]) => {
    console.log(`${colors.green(company)} - ${[...techOverlap].join(', ')}`)
  }

  if (perfectMatches.length > 0) {
    console.log(colors.bold('Perfect matches'))
    perfectMatches.forEach(logMatch)
    console.log()
  }

  console.log(colors.bold('All matches'))
  allMatches.forEach(logMatch)

  console.log('\n')
}

main()
