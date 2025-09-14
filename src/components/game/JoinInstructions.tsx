import { Card } from '@/components/ui/Card'
import { QRCode } from '@/components/ui/QRCode'

interface JoinInstructionsProps {
  roomCode: string
  compact?: boolean
}

export function JoinInstructions({ roomCode, compact = false }: JoinInstructionsProps) {
  const joinUrl = `${window.location.origin}/join/${roomCode}`
  
  if (compact) {
    return (
      <Card className="text-center my-4" padding="sm">
        <div className="flex items-center justify-center gap-4">
          <div>
            <QRCode data={joinUrl} size="sm" />
          </div>
          <div className="ml-4 text-left">
            <div className="text-sm font-medium text-orange-500">Rejoindre</div>
            <div className="font-mono text-xs">{roomCode}</div>
            <div className="text-xs text-gray-400">Scannez le QR</div>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="text-center" padding="md">
      <h3 className="text-lg font-bold text-orange-500 mb-4">Rejoindre la partie</h3>
      
      <QRCode data={joinUrl} size="md" className="mx-auto" />
      
      <div className="space-y-2">
        <div className="text-xl font-bold font-mono bg-slate-700 p-2 rounded">
          {roomCode}
        </div>
        <div className="text-sm text-gray-400">
          Scannez le QR code ou allez sur :
        </div>
        <div className="text-xs text-gray-500 font-mono break-all">
          {joinUrl}
        </div>
      </div>
    </Card>
  )
}