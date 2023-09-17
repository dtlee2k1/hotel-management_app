import { EmailAuth, UserAuth } from '../types/auth.type'
import supabase from './supabase'

export async function signUp({ fullName, email, password }: UserAuth) {
  let {
    data: { user },
    error
  } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        fullName,
        avatar: ''
      }
    }
  })

  if (error) throw new Error((error as Error).message)

  return user
}

export async function login({ email, password }: EmailAuth) {
  let { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) {
    throw new Error('Provided email or password is incorrect')
  }

  return data
}

export async function getCurrentUser() {
  let { data: session } = await supabase.auth.getSession()
  if (!session.session) return null

  const {
    data: { user },
    error
  } = await supabase.auth.getUser()

  if (error) throw new Error((error as Error).message)

  return user
}

export async function logout() {
  let { error } = await supabase.auth.signOut()
  if (error) throw new Error((error as Error).message)
}