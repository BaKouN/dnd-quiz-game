// components/pages/LandingPage.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { gameEngine } from '@/lib/game/gameEngine'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { JoinInstructions } from '@/components/game/JoinInstructions'

export function LandingPage() {
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)
  const [gameRoom, setGameRoom] = useState<{roomCode: string, gameId: string} | null>(null)

  const createNewGame = async () => {
    setIsCreating(true)
    try {
      const result = await gameEngine.createGame()
      setGameRoom(result)
    } catch (error) {
      console.error('Error creating game:', error)
      alert('Erreur lors de la création de la partie')
    } finally {
      setIsCreating(false)
    }
  }

  const goToHostView = () => {
    if (gameRoom) {
      router.push(`/game/${gameRoom.roomCode}`)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="text-center py-12 px-6">
        <h1 className="text-5xl font-bold text-orange-500 mb-4">
          DnD Workshop
        </h1>
        <p className="text-xl text-gray-300 mb-2">
          Créateur d&apos;expériences web interactives phygitales
        </p>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Spécialisé dans la conception de sites web qui mélangent digital et événementiel 
          pour engager les communautés et transformer vos visiteurs en participants actifs.
        </p>
      </div>

      {/* Quiz Introduction */}
      <div className="max-w-4xl mx-auto px-6 mb-12">
        <Card className="text-center" padding="lg">
          <h2 className="text-3xl font-bold text-orange-500 mb-6">
            QUIZ LEAD MILLIONAIRE
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-slate-700 p-4 rounded">
              <div className="text-2xl font-bold text-orange-500">5 Minutes</div>
              <div className="text-gray-300">Durée du quiz</div>
            </div>
            <div className="bg-slate-700 p-4 rounded">
              <div className="text-2xl font-bold text-orange-500">5 Questions</div>
              <div className="text-gray-300">Sur le marketing digital</div>
            </div>
            <div className="bg-slate-700 p-4 rounded">
              <div className="text-2xl font-bold text-orange-500">1M Leads</div>
              <div className="text-gray-300">Potentiel maximum</div>
            </div>
          </div>

          <div className="bg-slate-700 p-6 rounded-lg mb-8">
            <h3 className="text-xl font-bold mb-4">Apprenez en vous amusant</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-300">
              <div>✓ Statistiques réelles d&apos;engagement web</div>
              <div>✓ Cas concrets pour votre secteur</div>
              <div>✓ ROI du marketing interactif</div>
              <div>✓ Stratégies d&apos;acquisition client</div>
            </div>
          </div>

          {!gameRoom ? (
            <Button 
              onClick={createNewGame} 
              disabled={isCreating}
              size="lg"
              className="text-xl px-8 py-4"
            >
              {isCreating ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Création en cours...
                </>
              ) : (
                'Créer une partie'
              )}
            </Button>
          ) : (
            <div className="space-y-4">
              <Button 
                onClick={goToHostView}
                variant="success" 
                size="lg"
                className="mr-4"
              >
                Écran Host →
              </Button>
              <Button 
                onClick={() => setGameRoom(null)}
                variant="secondary" 
                size="lg"
              >
                Nouvelle partie
              </Button>
            </div>
          )}
        </Card>
      </div>

      {/* QR Code Section */}
    {gameRoom && (
        <div className="max-w-md mx-auto px-6 mb-12">
            <JoinInstructions roomCode={gameRoom.roomCode} />
            
            <div className="mt-4 p-4 bg-slate-800 rounded text-sm">
            <p className="text-orange-400 font-medium mb-2">Instructions :</p>
            <ol className="text-left space-y-1 text-gray-300">
                <li>1. Les participants scannent le QR code</li>
                <li>2. Attendez que tous se connectent</li>
                <li>3. Lancez le quiz depuis l&apos;écran host</li>
            </ol>
            </div>
        </div>
    )}

      {/* Footer */}
      <div className="text-center py-8 px-6 text-gray-400 text-sm border-t border-slate-700">
        <p>CA MATCH - La Rencontre des Entrepreneurs</p>
        <p className="mt-1">Démonstration interactive par Haroun BAKHOUCHE</p>
        <p className="mt-1">📧 haroun.bakhouche.hb@gmail.com</p>
      </div>
    </div>
  )
}