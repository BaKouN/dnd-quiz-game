// components/ui/QRCode.tsx - Version corrigée
interface QRCodeProps {
  data: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function QRCode({ data, size = 'md', className = '' }: QRCodeProps) {
  const generateQRCode = () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const qr = require('qrcode-generator')(4, 'L')
    qr.addData(data)
    qr.make()
    
    const moduleSize = {
      sm: 3,
      md: 4,
      lg: 6
    }[size]
    
    const svg = qr.createSvgTag(moduleSize)
    return { __html: svg }
  }

  const containerSizes = {
    sm: 'w-24 h-24',
    md: 'w-32 h-32', 
    lg: 'w-48 h-48'
  }

  return (
    <div className={`bg-white p-3 rounded-lg my-8 ${containerSizes[size]} ${className}`} 
         style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div dangerouslySetInnerHTML={generateQRCode()} />
    </div>
  )
}