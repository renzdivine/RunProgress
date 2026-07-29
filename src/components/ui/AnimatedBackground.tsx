import { useEffect, useRef } from 'react'

const frameModules = import.meta.glob(
  '../../assets/frames/scene*.png',
  { eager: true }
)

const frameUrls: string[] = Object.keys(frameModules)
  .sort()
  .map((key) => (frameModules[key] as { default: string }).default)

interface Props {
  onFrameChange?: (frame: number) => void
}

export default function AnimatedBackground({ onFrameChange }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const lastReportedFrame = useRef(-1)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const imgs: HTMLImageElement[] = []
    let loaded = 0
    let pendingFrame: number | null = null

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    const drawFrame = (index: number) => {
      const img = imgs[index]
      if (!img || !img.complete) return

      resizeCanvas()
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    }

    const updateFromScroll = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = docHeight > 0 ? scrollTop / docHeight : 0
      const frameIndex = Math.min(
        Math.floor(progress * (imgs.length - 1)),
        imgs.length - 1
      )
      drawFrame(frameIndex)
      if (onFrameChange && frameIndex !== lastReportedFrame.current) {
        lastReportedFrame.current = frameIndex
        onFrameChange(frameIndex)
      }
    }

    const onScroll = () => {
      if (pendingFrame !== null) cancelAnimationFrame(pendingFrame)
      pendingFrame = requestAnimationFrame(() => {
        updateFromScroll()
        pendingFrame = null
      })
    }

    frameUrls.forEach((url) => {
      const img = new Image()
      img.onload = () => {
        loaded++
        if (loaded === 1) updateFromScroll()
      }
      img.onerror = () => {
        loaded++
      }
      img.src = url
      imgs.push(img)
    })

    resizeCanvas()
    updateFromScroll()

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', updateFromScroll)

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', updateFromScroll)
      if (pendingFrame !== null) cancelAnimationFrame(pendingFrame)
    }
  }, [])

  return <canvas ref={canvasRef} className="animated-bg" />
}
