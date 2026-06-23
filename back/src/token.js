import crypto from 'node:crypto'

const SECRET = process.env.JWT_SECRET || 'golden-eagle-super-secret-key-987654321'

/**
 * Generates a simple cryptographically signed token containing user info.
 */
export function generateToken(user) {
  const payload = JSON.stringify({
    id: user._id,
    username: user.username,
    role: user.role
  })
  
  const tokenPayload = Buffer.from(payload).toString('base64')
  const signature = crypto.createHmac('sha256', SECRET).update(tokenPayload).digest('hex')
  
  return `${tokenPayload}.${signature}`
}

/**
 * Verifies a token and returns the parsed payload, or null if invalid.
 */
export function verifyToken(token) {
  if (!token) return null
  
  try {
    const parts = token.split('.')
    if (parts.length !== 2) return null
    
    const [payloadB64, signature] = parts
    const expectedSignature = crypto.createHmac('sha256', SECRET).update(payloadB64).digest('hex')
    
    if (signature !== expectedSignature) return null
    
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64').toString('utf8'))
    return payload
  } catch (error) {
    return null
  }
}
