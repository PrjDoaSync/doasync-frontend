import { useContext } from 'react'
import { DemoContext } from '../context/demoContextValue'

export function useDemo() {
  return useContext(DemoContext)
}
