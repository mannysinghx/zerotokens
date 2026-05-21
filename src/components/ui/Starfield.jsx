import { useMemo } from 'react'

export default function Starfield() {
  const stars = useMemo(() => {
    return Array.from({ length: 120 }, (_, i) => ({
      id: i,
      x:   Math.random() * 100,
      y:   Math.random() * 100,
      size: Math.random() * 2 + 0.5,
      dur:  (Math.random() * 3 + 2).toFixed(1) + 's',
      op:   (Math.random() * 0.4 + 0.1).toFixed(2),
    }))
  }, [])

  return (
    <div className="starfield" aria-hidden="true">
      {stars.map(s => (
        <div
          key={s.id}
          className="star"
          style={{
            left:   s.x + '%',
            top:    s.y + '%',
            width:  s.size + 'px',
            height: s.size + 'px',
            '--dur': s.dur,
            '--op':  s.op,
          }}
        />
      ))}
    </div>
  )
}
