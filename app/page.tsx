import { getLandingPageData } from '@/lib/sanity'
import SmokingEffect, { TopRightCellWithBurningLine, TopLeftCellWithLine } from '@/components/SmokingEffect'
import LogoImage from '@/components/LogoImage'

export default async function Home() {
  const data = await getLandingPageData()

  return (
    <SmokingEffect duration={data.smokingDuration || 10} burnAccelerationFactor={data.burnAccelerationFactor}>
      <div
        className="responsive-grid-rows no-select"
        style={{
          width: '100vw',
          height: '100svh',
          display: 'grid',
          gridTemplateColumns: '150fr 350fr',
          gap: '1rem',
          padding: '1rem',
          overflow: 'hidden',
          minWidth: 0,
        }}
        
      >
        {/* Top Left Cell - Logo Area */}
        <TopLeftCellWithLine>
          <div className="w-full flex flex-row justify-between">
            <LogoImage src="/logos/CHERRY.svg" alt="Cherry" className="h-3 sm:h-4 md:h-6 lg:h-8  w-auto object-contain"/>
            <LogoImage src="/logos/CIGARETTE.svg" alt="Cigarette" className="h-3 sm:h-4 md:h-6 lg:h-8  w-auto object-contain"/>
          </div>
        </TopLeftCellWithLine>

        {/* Top Right Cell - Content */}
        <TopRightCellWithBurningLine>
          <div className="flex flex-col items-end justify-end">
            {/* Company Name */}
            <LogoImage src="/logos/PRODUCTIONS.svg" alt="Productions" className="h-3 sm:h-4 md:h-6 lg:h-8 w-auto object-contain"/>

            


          </div>
        </TopRightCellWithBurningLine>

        {/* Bottom Left Cell */}
        <div className="flex flex-col items-start justify-between h-full" style={{ minWidth: 0 }}>
         <div className=""></div>

         {/* Bio - Desktop */}
         {data.bio && (
              <div className="leading-tight hidden md:block">
                {data.bio}
              </div>
            )}

        {/* Contact Section */}
            <div className="mt-auto w-full flex flex-col md:flex-row items-start md:justify-between gap-4">
                {data.contact && (
                <div className="">
                    {data.contact}
                </div>
                )}
                <div className="block md:hidden"></div>
                {data.email && (
                <div className="hidden md:block">
                    <a 
                      href={`mailto:${data.email}`}
                      className="hover:underline"
                    >
                      {data.email}
                    </a>
                </div>
                )}
            </div>   
        </div>

        {/* Bottom Right Cell */}
        <div className="flex flex-col items-end justify-between md:items-end md:justify-end h-full" style={{ minWidth: 0 }}>
        {/* Bio - Mobile */}
        <div className="md:hidden"></div>
            {data.bio && (
                <div className="leading-tight block md:hidden">
                    {data.bio}
                </div>
                )}
            {/* Footer */}
            <div>
            {data.email && (
                    <div className="md:hidden text-right">
                        <a 
                          href={`mailto:${data.email}`}
                          className="hover:underline"
                        >
                          {data.email}
                        </a>
                    </div>
                    )}
                <div className="mt-auto pt-8">
                © {new Date().getFullYear()} CHERRY CIGARETTE PRODUCTIONS
                </div>
            </div>
        </div>
      </div>
    </SmokingEffect>
  )
}

