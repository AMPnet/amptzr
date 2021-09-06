import {VercelRequest, VercelResponse} from '@vercel/node'
import fetch from 'node-fetch'

/**
 * Basic settings
 */

// The API key visible on your Prerender dashboard.
const API_KEY = 'zD7SoiYBUUJmDHCY3hKO'

/**
 * Advanced settings
 */

  // These are the user agents that the worker will look for to
  // initiate prerendering of the site.
const BOT_AGENTS = [
    'googlebot',
    'yahoo! slurp',
    'bingbot',
    'yandex',
    'baiduspider',
    'facebookexternalhit',
    'twitterbot',
    'rogerbot',
    'linkedinbot',
    'embedly',
    'quora link preview',
    'showyoubot',
    'outbrain',
    'pinterest/0.',
    'developers.google.com/+/web/snippet',
    'slackbot',
    'vkshare',
    'w3c_validator',
    'redditbot',
    'applebot',
    'whatsapp',
    'flipboard',
    'tumblr',
    'bitlybot',
    'skypeuripreview',
    'nuzzel',
    'discordbot',
    'google page speed',
    'qwantify',
    'pinterestbot',
    'bitrix link preview',
    'xing-contenttabreceiver',
    'chrome-lighthouse',
  ]

// These are the extensions that the worker will skip prerendering
// even if any other conditions pass.
const IGNORE_EXTENSIONS = [
  '.js',
  '.css',
  '.xml',
  '.less',
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.pdf',
  '.doc',
  '.txt',
  '.ico',
  '.rss',
  '.zip',
  '.mp3',
  '.rar',
  '.exe',
  '.wmv',
  '.doc',
  '.avi',
  '.ppt',
  '.mpg',
  '.mpeg',
  '.tif',
  '.wav',
  '.mov',
  '.psd',
  '.ai',
  '.xls',
  '.mp4',
  '.m4a',
  '.swf',
  '.dat',
  '.dmg',
  '.iso',
  '.flv',
  '.m4v',
  '.torrent',
  '.woff',
  '.ttf',
  '.svg',
  '.webmanifest',
]

export default (request: VercelRequest, response: VercelResponse) => {
  const url = new URL(extractURL(request))
  const requestUserAgent = (request.headers['User-Agent']?.[0] || '').toLowerCase()
  const xPrerender = request.headers['X-Prerender'] as string

  console.log(xPrerender, requestUserAgent, containsOneOfThem(BOT_AGENTS, requestUserAgent))

  console.log('user agent', requestUserAgent)
  if (
    !xPrerender
    && containsOneOfThem(BOT_AGENTS, requestUserAgent)
  ) {
    console.log('prerender request')
    return prerenderRequest(request).then((res: any) => response.send(res))
  }

  return response.redirect(url.toString())
}

function extractURL(request: VercelRequest) {
  const origin = `${request.headers['x-forwarded-proto']}://${request.headers['x-forwarded-host']}`
  const networkID = request.query?.networkID ? request.query.networkID as string : undefined
  const issuerID = request.query?.issuerID ? request.query.issuerID as string : undefined
  const offerID = request.query.offerID as string

  console.log(origin, networkID, issuerID, offerID)

  let path = `/offers/${offerID}`
  if (issuerID) path = `/${issuerID}`.concat(path)
  if (networkID) path = `/${networkID}`.concat(path)
  const fullPath = `${origin}${path}`
  console.log(fullPath)
  return fullPath
}

/**
 * Helper function to check if an array contains an element or not.
 *
 * @param {string[]} array - The array to check.
 * @param {string} element - The element to check if the array contains.
 * @returns {boolean}
 */
function containsOneOfThem(array: string[], element: string) {
  return array.some(e => element.indexOf(e) !== -1)
}

/**
 * Function to request the prerendered version of a request.
 *
 * @param {Request} request - The request received by CloudFlare
 * @returns {Promise<Response>}
 */
function prerenderRequest(request: VercelRequest) {
  const {url} = request
  const prerenderUrl = `https://service.prerender.io/${url}`

  return fetch(prerenderUrl, {
    headers: {
      // ...request.headers,
      'X-Prerender-Token': API_KEY,
    },
    redirect: 'manual',
  })
}
