interface AnswerButtonsProps {
  answers: string[]
  onAnswerSelect: (index: number) => void
  selectedAnswer: number | null
  disabled: boolean
}

export function AnswerButtons({ 
  answers, 
  onAnswerSelect, 
  selectedAnswer, 
  disabled 
}: AnswerButtonsProps) {
  return (
    <div className="space-y-3 mb-6">
      {answers.map((answer, index) => {
        const isSelected = selectedAnswer === index
        
        return (
          <button
            key={index}
            onClick={() => !disabled && onAnswerSelect(index)}
            disabled={disabled}
            className={`w-full p-4 rounded-lg text-left font-medium transition-all duration-200 ${
              disabled 
                ? isSelected 
                  ? 'bg-orange-500 text-white transform scale-105' 
                  : 'bg-slate-700 text-gray-400'
                : 'bg-slate-800 text-white hover:bg-slate-700 active:transform active:scale-95'
            }`}
          >
            <span className="font-bold text-orange-500 mr-3 text-xl">
              {'ABCD'[index]}
            </span>
            <span className="text-base">{answer}</span>
          </button>
        )
      })}
    </div>
  )
}