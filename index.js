'use strict';
const fs       = require('fs')
const os       = require('os')
const path     = require('path')
const core     = require('@actions/core')
const marked   = require('marked')
const { execSync } = require('child_process')
const {context, GitHub} = require('@actions/github')
const LanguageDetect = require('languagedetect')

const startedDatetime  = new Date()


function cfg(key) {
  console.assert(typeof key === "string", `key must be string, but got ${ typeof key }`)
  const result = core.getInput(key, {required: true}).trim()
  console.assert(typeof result === "string", `result must be string, but got ${ typeof result }`)
  return result;
};


function checkAuthorAssociation() {
  const authorPerm = context.payload.comment.author_association.trim().toLowerCase()
  let result = (authorPerm === "owner" || authorPerm === "collaborator" || authorPerm === "member")
  console.assert(typeof result === "boolean", `result must be boolean, but got ${ typeof result }`)
  return result
};


async function addReaction(githubClient, reaction) {
  console.assert(typeof reaction === "string", `reaction must be string, but got ${ typeof reaction }`)
  return (await githubClient.reactions.createForIssueComment({
    comment_id: context.payload.comment.id,
    content   : reaction.trim().toLowerCase(),
    owner     : context.repo.owner,
    repo      : context.repo.repo,
  }) !== undefined)
};


async function addIssueComment(githubClient, issueCommentBody) {
  console.assert(typeof issueCommentBody === "string", `issueCommentBody must be string, but got ${ typeof issueCommentBody }`)
  return (await githubClient.issues.createComment({
    issue_number: context.issue.number,
    owner       : context.repo.owner,
    repo        : context.repo.repo,
    body        : issueCommentBody.trim(),
  }) !== undefined)
};


function parseGithubComment(comment) {
  console.assert(typeof comment === "string", `comment must be string, but got ${ typeof comment }`)
  const tokens = marked.Lexer.lex(comment)
  const allowedFileExtensions = ["c", "cpp", "c++", "h", "hpp", "js", "json", "txt"]
  let result = ""
  for (const token of tokens) {
    if (token.type === 'code' && token.text.length > 0 && token.lang !== undefined) {
      if (token.lang === 'nim') {
        if (nimFileCounter > 0) {
          const xtraFile = temporaryFile.replace(".nim", `${ nimFileCounter }.nim`)
          if (!fs.existsSync(xtraFile)) {
            fs.writeFileSync(xtraFile, token.text.trim())
            fs.chmodSync(xtraFile, "444")
          }
        } else {
          nimFileCounter += 1
          result = token.text.trim()
          result = result.split('\n').filter(line => line.trim() !== '').join('\n')
        }
      } else if (allowedFileExtensions.includes(token.lang)) {
        const xtraFile = `${ process.cwd() }/temp.${token.lang}`
        if (!fs.existsSync(xtraFile)) {
          fs.writeFileSync(xtraFile, token.text.trim())
          fs.chmodSync(xtraFile, "444")
        }
      } else if (token.lang === 'cfg' || token.lang === 'ini') {
        const xtraFile = `${ temporaryFile }.cfg`
        if (!fs.existsSync(xtraFile)) {
          fs.writeFileSync(xtraFile, token.text.trim())
          fs.chmodSync(xtraFile, "444")
        }
      }
    }
  }
  return result
}


// Only run if this is an "issue_comment" and comment startsWith commentPrefixes.
if (true ) {

  console.log(context.payload)

  // Check if we have permissions.
  const githubClient  = new GitHub(cfg('github-token'))
  // Add Reaction of "Eyes" as seen.
  const githubComment = context.payload.comment.body.trim()
  const detector = new LanguageDetect()
  const language = detector.detect(githubComment, 5)

  if (language && language.length > 0) {
    const isEnglish = language.some(language => language[0] === 'english')
    console.log("isEnglish", isEnglish)
    if (!isEnglish) {
      console.log("NOT ENGLISH")

    }

  } else {
    console.warn("Language detection failed.")
  }


  } else { console.warn("githubClient.addReaction failed, repo permissions error?.")
}
