import React from 'react'

export type SlotComponent = React.ComponentType<any>

export class SlotRegistry {
  private map = new Map<string, SlotComponent[]>()

  register(name: string, comp: SlotComponent) {
    if (!this.map.has(name)) this.map.set(name, [])
    this.map.get(name)!.push(comp)
  }

  get(name: string): SlotComponent[] {
    return this.map.get(name) || []
  }
}

export const globalSlots = new SlotRegistry()

export const RenderSlot: React.FC<{ name: string; props?: any }> = ({ name, props }) => {
  const list = globalSlots.get(name)
  if (!list.length) return null
  return (
    <>
      {list.map((C, i) => (
        <C key={`${name}-${i}`} {...props} />
      ))}
    </>
  )
}


