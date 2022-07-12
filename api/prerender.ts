import { VercelRequest, VercelResponse } from '@vercel/node'
// @ts-ignore
import fetch from 'node-fetch'
import { environment } from '../src/environments/environment'

const API_KEY = environment.prerenderApiKey

export default (request: VercelRequest, response: VercelResponse) => {
  const url = new URL(extractURL(request))
  const xPrerender = request.headers['x-prerender'] as string

  if (!xPrerender) {
    return prerenderRequest(url.toString())
      .then((res: any) => res.text())
      .then((res: any) => response.status(200).send(res))
  }

  return fetch(url).then((res: any) => response.send(res))
}

function extractURL(request: VercelRequest) {
  const origin = `${request.headers['x-forwarded-proto']}://${request.headers['x-forwarded-host']}`
  const networkID = request.query?.networkID as string
  const issuerID = request.query?.issuerID as string
  const offerID = request.query.offerID as string
  let path = `/offers/${offerID}`
  if (issuerID) path = `/${issuerID}`.concat(path)
  if (networkID) path = `/${networkID}`.concat(path)

  return `${origin}${path}`
}

function prerenderRequest(url: string) {
  const prerenderUrl = `https://service.prerender.io/${url}`

  return fetch(prerenderUrl, {
    headers: {
      'X-Prerender-Token': API_KEY,
    },
    redirect: 'manual',
  })
}
