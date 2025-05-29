import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const response = await fetch(
    `${process.env.AI_URL}/ask`,
    {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(req.body),
    }
  )
  const data = await response.json()
  res.status(response.status).json(data)
}