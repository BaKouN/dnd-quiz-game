// components/game/JoinGameForm.tsx
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

interface JoinGameFormProps {
  roomCode: string
  onJoin: (name: string, email?: string) => Promise<void>
  isLoading?: boolean
}

export function JoinGameForm({ roomCode, onJoin, isLoading = false }: JoinGameFormProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || isLoading) return

    setError('')
    
    try {
      await onJoin(name.trim(), email.trim() || undefined)
    } catch (error) {
      console.error('Error joining game:', error)
      setError('Impossible de rejoindre la partie. Vérifiez le code.')
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-orange-500">LEAD MILLIONAIRE</h1>
        <p className="text-gray-300 mt-2">Rejoignez la partie</p>
        <Card className="mt-4" padding="sm">
          <div className="text-xl font-mono">Room: {roomCode}</div>
        </Card>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Votre nom *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 bg-slate-800 rounded border border-slate-600 text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none"
            placeholder="Entrez votre nom"
            required
            disabled={isLoading}
            maxLength={50}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Email (optionnel)
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 bg-slate-800 rounded border border-slate-600 text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none"
            placeholder="votre@email.com"
            disabled={isLoading}
            maxLength={100}
          />
          <div className="text-xs text-gray-400 mt-1">
            Pour recevoir des infos sur le marketing digital
          </div>
        </div>

        {error && (
          <Card className="!bg-red-900/20 border border-red-500">
            <div className="text-red-400 text-sm">{error}</div>
          </Card>
        )}

        <Button
          type="submit"
          disabled={isLoading || !name.trim()}
          className="w-full"
          size="lg"
        >
          {isLoading ? 'Connexion...' : 'Rejoindre la partie'}
        </Button>
      </form>

      <Card className="mt-8 text-center" padding="sm">
        <div className="text-gray-400 text-sm space-y-1">
          <p>Quiz éducatif sur le marketing digital</p>
          <p>5 questions • 5 minutes max</p>
          <p>Apprenez en vous amusant !</p>
        </div>
      </Card>
    </div>
  )
}