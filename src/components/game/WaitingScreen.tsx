import { Card } from '@/components/ui/Card'

interface WaitingScreenProps {
  type: 'game-start' | 'game-finished' | 'next-question'
  playerName: string
  currentScore: number
  totalPlayers?: number
  playerRank?: number
  message?: string
}

export function WaitingScreen({ 
  type, 
  playerName, 
  currentScore, 
  totalPlayers, 
  playerRank,
  message 
}: WaitingScreenProps) {
  const getTitle = () => {
    switch (type) {
      case 'game-start': return 'En attente...'
      case 'game-finished': return 'PARTIE TERMINÉE'
      case 'next-question': return 'Question suivante...'
    }
  }

  const getMessage = () => {
    if (message) return message
    
    switch (type) {
      case 'game-start': return 'Le jeu va bientôt commencer !'
      case 'game-finished': return 'Merci d\'avoir participé !'
      case 'next-question': return 'En attente des autres joueurs...'
    }
  }

  return (
    <div className="max-w-md mx-auto text-center">
      <h1 className="text-2xl font-bold text-orange-500 mb-6">LEAD MILLIONAIRE</h1>
      
      <Card className="mb-6">
        <h2 className="text-xl font-bold mb-4">{getTitle()}</h2>
        {type === 'game-finished' && <div className="text-4xl mb-4">🎉</div>}
        <p className="text-gray-300">{getMessage()}</p>
        {playerRank && type === 'game-finished' && (
          <div className="text-gray-300 mt-2">Vous avez terminé #{playerRank}</div>
        )}
      </Card>

      <div className="space-y-4">
        <Card className="text-center" padding="md">
          <div className="text-lg font-medium">{playerName}</div>
          <div className="text-sm text-gray-400">
            {type === 'game-finished' ? 'Score final' : 'Joueur connecté'}
          </div>
        </Card>
        
        <Card className="text-center" padding="md">
          <div className="text-2xl font-bold text-orange-500">
            {currentScore.toLocaleString()}
          </div>
          <div className="text-sm text-gray-400">
            {type === 'game-finished' ? 'Leads gagnés' : 'Leads actuels'}
          </div>
        </Card>

        {totalPlayers && type === 'game-start' && (
          <Card className="text-center" padding="md">
            <div className="text-lg font-bold">{totalPlayers}</div>
            <div className="text-sm text-gray-400">Joueurs connectés</div>
          </Card>
        )}
      </div>

      <div className="mt-8 text-gray-400 text-sm">
        {type === 'game-start' && <p>Attendez que l&apos;hôte démarre la partie...</p>}
        {type === 'game-finished' && <p>Quiz éducatif par DnD Workshop</p>}
        {type === 'next-question' && <p>Réponse enregistrée !</p>}
      </div>
    </div>
  )
}