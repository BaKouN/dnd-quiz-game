import { Card } from '@/components/ui/Card'
import type { Question } from '@/lib/game/questions'

interface QuestionDisplayProps {
  question: Question
  showAnswers?: boolean
  size?: 'desktop' | 'mobile'
}

export function QuestionDisplay({ 
  question, 
  showAnswers = true, 
  size = 'desktop' 
}: QuestionDisplayProps) {
  const isDesktop = size === 'desktop'
  
  return (
    <Card className="text-center mb-8" padding={isDesktop ? 'lg' : 'md'}>
      <div className={isDesktop ? 'text-3xl font-bold text-orange-500 mb-4' : 'text-2xl font-bold text-orange-500 mb-3'}>
        {question.value.toLocaleString()} LEADS
      </div>
      
      <div className={isDesktop ? 'text-2xl mb-6' : 'text-lg leading-relaxed'}>
        {question.question}
      </div>
      
      {showAnswers && (
        <div className={isDesktop ? 'grid grid-cols-2 gap-4' : 'space-y-2 text-left'}>
          {question.answers.map((answer, index) => (
            <div 
              key={index} 
              className={isDesktop 
                ? 'bg-slate-700 p-4 rounded text-lg' 
                : 'bg-slate-700 p-3 rounded text-sm'
              }
            >
              <span className="font-bold text-orange-500 mr-2">
                {'ABCD'[index]}:
              </span>
              {answer}
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}