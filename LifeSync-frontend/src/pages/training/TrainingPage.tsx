import { TrainingSummary } from '@/features/cognitive-training'
import { AppFooter } from '@/features/footer'
import { AppHeader } from '@/features/gnb'
import { useNavigate } from 'react-router-dom'

export function TrainingPage() {
  const navigate = useNavigate()

  //훈련 메뉴 데이터
  const trainingMenus = [
    { id: 'memory', title: '기억력 훈련', description: '카드 짝 맞추기', path: '/training/memory', color: 'bg-blue-500'},
    { id: 'judgment', title: '판단력 훈련', description: '상황 판단 퀴즈', path: '/training/judgment', color: 'bg-green-500' },
    { id: 'attention', title: '집중력 훈련', description: '순서 따라가기', path: '/training/attention', color: 'bg-orange-500' }
  ];

  return (
    <main className="min-h-screen bg-base">
      <AppHeader />

      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-4 py-12 md:px-6">
        <section>
          <h2 className='mb-6 text-2xl font-bold text-gray-800'>나의 훈련 현황</h2>
        <TrainingSummary />
        </section>

        <section className='grid grid-cols-1 gap-6 md:grid-cols-3'>
          {trainingMenus.map(menu => (
            <button
              key={menu.id}
              onClick={() => navigate(menu.path)}
              className='group relative overflow-hidden rounded-3xl bg-white p-8 shadow-md transition-all hover:shadow-xl active:scale-95 border-2 border-transparent hover:border-primary'>
                <div className={'mb-4 inline-block rounded-2xl ${menu.color} p-4 text-white'}>
                  <span className='text-2xl font-bold'>{menu.title[0]}</span>
                </div>
                <h3 className="text-2xl font-black text-gray-900">{menu.title}</h3>
                <p className="mt-2 text-lg font-medium text-gray-500">{menu.description}</p>

                <div className="mt-6 flex items-center text-primary font-bold">
                  <span>시작하기</span>
                  <span className="ml-2 transition-transform group-hover:translate-x-2">→</span>
                </div>
              </button>
          ))}
        </section>
      </div>
      
      <AppFooter />
    </main>
  )
}
