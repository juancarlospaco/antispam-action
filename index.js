'use strict';
const fs       = require('fs')
const os       = require('os')
const path     = require('path')
const core     = require('@actions/core')
const marked   = require('marked')
const { execSync } = require('child_process')
const {context, GitHub} = require('@actions/github')
const LanguageDetect = require('languagedetect')


function cfg(key) {
  console.assert(typeof key === "string", `key must be string, but got ${ typeof key }`)
  const result = core.getInput(key, {required: true}).trim()
  console.assert(typeof result === "string", `result must be string, but got ${ typeof result }`)
  return result;
};


async function deleteIssue(githubClient) {
  // Theres no API for Deleting issues, so we edit it to blank instead.
  return (await githubClient.issues.update({
    issue_number: context.payload.issue.number,
    owner       : context.repo.owner,
    repo        : context.repo.repo,
    title       : "",
    body        : "",
    labels      : [],
    assignees   : [],
    // state       : "closed",
    // state_reason: "Edited for suspected Spam",
  }) !== undefined)
};


// Only run if this is a new issue opened and author is not owner or collaborator.
if (context.payload.action === 'opened' && context.payload.issue.state === 'open' && context.payload.issue.author_association !== 'NONE') {
  // Get issue title and body as a string.
  const title = context.payload.issue.title.trim()
  const body  = context.payload.issue.body.trim()
  // If we have the title and body as strings.
  if (title && title.length > 0 && body && body.length > 0) {
    // Detect language from title and body strings.
    const detector      = new LanguageDetect()
    const titleLanguage = detector.detect(title, 5)
    const bodyLanguage  = detector.detect(body, 5)
    console.log("titleLanguage", titleLanguage)
    console.log("bodyLanguage", bodyLanguage)
    // If language is detected in title and body
    if (bodyLanguage && bodyLanguage.length > 0 && titleLanguage && titleLanguage.length > 0) {
      const titleIsEnglish = titleLanguage.some(it => it[0] === 'english')
      const bodyIsEnglish  = bodyLanguage.some( it => it[0] === 'english')
      console.log("titleIsEnglish", titleIsEnglish)
      console.log("bodyIsEnglish" , bodyIsEnglish)
      // If it is English
      if (titleIsEnglish && bodyIsEnglish) {
        console.log("ENGLISH")
      } else {
        console.log("NOT ENGLISH")
        const githubClient  = new GitHub(cfg('github-token'))
        console.log(deleteIssue(githubClient))
      }
    } else {
      console.warn("ANTISPAM: Language detection failed.")
    }
  } else {
    console.warn("ANTISPAM: Issue title or body is empty.")
  }
}
