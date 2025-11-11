import FingerprintJS from '@fingerprintjs/fingerprintjs'
import { supabase } from './supabaseClient'

const loginFunctionName =
  import.meta.env.VITE_SUPABASE_LOGIN_FUNCTION?.trim() || 'log-login'

let fpPromise = null
let lastReportedAccessToken = null

if (typeof window !== 'undefined') {
  fpPromise = FingerprintJS.load({ monitoring: false }).catch((error) => {
    console.error('Failed to initialize device fingerprinting', error)
    return null
  })
}

const buildClientFingerprint = async () => {
  if (!fpPromise) {
    return null
  }

  try {
    const fp = await fpPromise
    if (!fp) return null

    const { visitorId, components } = await fp.get()

    return {
      device_id: visitorId,
      components,
    }
  } catch (error) {
    console.warn('Unable to generate fingerprint', error)
    return null
  }
}

const buildDeviceContext = () => {
  if (typeof window === 'undefined') {
    return {}
  }

  const { screen, navigator } = window

  return {
    user_agent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    screen: screen ? `${screen.width}x${screen.height}` : undefined,
  }
}

export const reportLoginActivity = async (session) => {
  if (!session?.access_token) return

  if (lastReportedAccessToken === session.access_token) {
    return
  }

  lastReportedAccessToken = session.access_token

  const fingerprint = await buildClientFingerprint()
  const deviceContext = buildDeviceContext()

  try {
    const { error } = await supabase.functions.invoke(loginFunctionName, {
      body: {
        ...fingerprint,
        ...deviceContext,
        login_at: new Date().toISOString(),
      },
      headers: {
        authorization: `Bearer ${session.access_token}`,
      },
    })

    if (error) {
      throw error
    }
  } catch (error) {
    console.error('Failed to report login activity', error)
  }
}


