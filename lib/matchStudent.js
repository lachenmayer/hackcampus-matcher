'use strict'
const fs = require('fs')

const dataDir = `${__dirname}/../companies`

module.exports = (techPreferences, companyPreferences) => {
  const companies = getCompanyStacks()
  const techUsers = getTechUsers(companies)
  const matches = getMatches(techPreferences, techUsers)
  const sortedMatches = sortMatches(matches)
  const perfectMatches = getPerfectMatches(matches, companyPreferences)
  return {
    allMatches: sortedMatches,
    perfectMatches: perfectMatches,
  }
}

// () -> [(company, [tech])]
const getCompanyStacks = () => {
  const companyNames = fs.readdirSync(dataDir)
  const companies = companyNames.map(companyName => {
    const fileContent = fs.readFileSync(`${dataDir}/${companyName}`, {encoding: 'utf8'})
    const stack = fileContent.split('\n').filter(line => line != '')
    return [companyName, stack]
  })
  return companies
}

// [(company, [tech])] -> {tech => [company]}
const getTechUsers = (companies) => {
  let techUsers = {}
  companies.forEach(([companyName, stack]) => {
    stack.forEach(tech => {
      if (techUsers.hasOwnProperty(tech)) {
        techUsers[tech].add(companyName)
      } else {
        techUsers[tech] = new Set([companyName])
      }
    })
  })
  return techUsers
}

// [tech] -> {tech => [company]} -> {company => [tech]}
const getMatches = (techPreferences, techUsers) => {
  let matches = {}
  techPreferences.forEach(tech => {
    if (!techUsers.hasOwnProperty(tech)) {
      return
    }
    techUsers[tech].forEach(company => {
      if (matches.hasOwnProperty(company)) {
        matches[company].add(tech)
      } else {
        matches[company] = new Set([tech])
      }
    })
  })
  return matches
}

// {company => [tech]} -> [(company, [tech])]
const sortMatches = (matches) => {
  let scoredMatches = []
  for (let company in matches) {
    let overlaps = matches[company]
    scoredMatches.push([company, overlaps])
  }
  return scoredMatches.sort(([_a, a], [_b, b]) => b.size - a.size)
}

// {company => [tech]} -> [company] -> [(company, [tech])]
const getPerfectMatches = (matches, companyPreferences) => {
  let perfectMatches = {}
  companyPreferences.forEach(company => {
    if (matches.hasOwnProperty(company)) {
      perfectMatches[company] = matches[company]
    }
  })
  return sortMatches(perfectMatches)
}
