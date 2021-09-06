import {VercelRequest, VercelResponse} from '@vercel/node'
// @ts-ignore
import fetch from 'node-fetch'

const API_KEY = 'zD7SoiYBUUJmDHCY3hKO'

export default (request: VercelRequest, response: VercelResponse) => {
  const url = new URL(extractURL(request))
  const xPrerender = request.headers['x-prerender'] as string

  console.log('url', url)
  console.log('xPrerender', xPrerender)

  if (!xPrerender) {
    return prerenderRequest(url.toString())
      .then((res: any) => response.status(200).send(res))
  }

  return fetch(url)
    .then((res: any) => response.send(res))
}

function extractURL(request: VercelRequest) {
  // const origin = 'https://amptzr-git-sd-360-prerender-vercel-ampnetx.vercel.app'
  const origin = `${request.headers['x-forwarded-proto']}://${request.headers['x-forwarded-host']}`
  const networkID = request.query?.networkID as string
  const issuerID = request.query?.issuerID as string
  const offerID = request.query.offerID as string
  let path = `/offers/${offerID}`
  if (issuerID) path = `/${issuerID}`.concat(path)
  if (networkID) path = `/${networkID}`.concat(path)

  console.log('path', `${origin}${path}`)
  return `${origin}${path}`
}

function prerenderRequest(url: string) {
  const prerenderUrl = `https://service.prerender.io/${url}`

  return fetch(prerenderUrl, {
    headers: {
      'X-Prerender-Token': API_KEY,
    },
    redirect: 'manual',
  }).then((res: any) => {
    console.log('fetch res', res)
    console.log('fetch res text', res.text())
    return res.text()
  })
}
