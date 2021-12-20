import styled from 'styled-components'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { fetchMoviePlayList, fetchTvList, iMovie, iMovies } from '../api'
import { getBackgroundImg } from '../utils'
import { useHistory, useParams, useRouteMatch } from 'react-router'
import ContentDetail from '../components/ContentDetail'
import { useQuery } from 'react-query'

const SliderWrapper = styled.div`
  position: relative;
  top: -100px;
  height: 200px;
`

const Row = styled(motion.div)`
  width: 100%;
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  position: absolute;
  gap: 5px;
`
const LoadingSlide = styled.div`
  width: 100%;
  height: 150px;
`

const Box = styled(motion.div)<{ img: string }>`
  background-color: white;
  background-image: url(${props => props.img});
  background-size: cover;
  background-position: center center;
  cursor: pointer;
  height: 150px;
  &:first-child {
    transform-origin: center left;
  }
  &:last-child {
    transform-origin: center right;
  }
`

const Info = styled(motion.div)`
  padding: 10px;
  background-color: ${props => props.theme.dark.darker};
  opacity: 0;
  position: absolute;
  width: 91%;
  bottom: 0;
  h4 {
    text-align: center;
    font-size: 18px;
  }
`

const BoxVariants = {
  hover: {
    scale: 1.3,
    y: -40,
    transition: {
      type: 'tween',
      duration: 0.2,
      delay: 0.3
    }
  }
}

const rowVariants = {
  hidden: {
    x: window.outerWidth + 10
  },
  visible: {
    x: 0
  },
  exit: {
    x: -window.outerWidth - 10
  }
}

const infoVariants = {
  hover: {
    opacity: 1,
    transition: {
      type: 'tween',
      duration: 0.2,
      delay: 0.3
    }
  }
}
const Title = styled.p`
  font-size: 40px;
  margin-left: 35px;
`

const LeftButton = styled.button`
  font-size: 30px;
  position: absolute;
  height: 100%;
  color: white;
  border: none;
  z-index: 1;
  background-color: rgba(0, 0, 0, 0.5);
  right: 0;
`

interface PHome {
  sliderType: string
}
const offset = 6
function Slider ({ sliderType }: PHome) {
  const history = useHistory()
  const isMatchTv = useRouteMatch('/tv')?.url === '/tv'
  const matchTvDetail = useRouteMatch<{ tvId: string }>('/tv/:tvId')
  const matchMovieDetail = useRouteMatch<{ movieId: string }>('/movie/:movieId')
  const [leaving, setLeaving] = useState(false)
  const [index, setIndex] = useState(0)
  const { isLoading, data } = useQuery<iMovies>(`tv-${sliderType}`, () =>
    isMatchTv ? fetchTvList(sliderType) : fetchMoviePlayList(sliderType)
  )

  function showContentDetail (contentId: number) {
    history.push(`/${isMatchTv ? 'tv' : 'movie'}/${String(contentId)}`)
  }
  const id = isMatchTv
    ? matchTvDetail?.params.tvId
    : matchMovieDetail?.params.movieId
  const clickedContent = data?.results.find(
    content => String(content.id) === id
  )

  function nextList () {
    const thisIndexIsBannerMovieIndex = -1
    const thisValueIsIndexStartValue1 = 1
    if (data) {
      const dataLength = data?.results.length
      const maxIndex = Math.ceil(
        (dataLength + thisIndexIsBannerMovieIndex) / offset
      )
      if (maxIndex <= index + thisValueIsIndexStartValue1) {
        setIndex(0)
        return
      }
      setIndex(prev => prev + 1)
    }
  }
  return (
    <SliderWrapper>
      <Title>{sliderType}</Title>
      {isLoading && !data ? (
        <LoadingSlide>Loading...</LoadingSlide>
      ) : (
        <>
          <AnimatePresence
            initial={false}
            onExitComplete={() => setLeaving(false)}
          >
            <Row
              variants={rowVariants}
              initial='hidden'
              animate='visible'
              exit='exit'
              key={index}
              transition={{
                type: 'tween',
                duration: 1
              }}
            >
              {data?.results
                .slice(offset * index, offset * index + offset)
                .map(contentData => {
                  return (
                    <Box
                      key={contentData.id}
                      variants={BoxVariants}
                      whileHover='hover'
                      transition={{ type: 'tween' }}
                      img={getBackgroundImg(contentData.backdrop_path, 'w500')}
                      onClick={() => showContentDetail(contentData.id)}
                      layoutId={`contents-${sliderType}-${contentData.id}`}
                    >
                      <Info variants={infoVariants}>
                        <h4>
                          {isMatchTv ? contentData.name : contentData.title}
                        </h4>
                      </Info>
                    </Box>
                  )
                })}
              <LeftButton onClick={nextList}>&rarr;</LeftButton>
            </Row>
            {(matchMovieDetail || matchTvDetail) && clickedContent ? (
              <ContentDetail
                id={String(clickedContent?.id)}
                layoutId={
                  isMatchTv
                    ? `${matchTvDetail?.params.tvId}`
                    : `${matchMovieDetail?.params.movieId}`
                }
                title={
                  isMatchTv
                    ? clickedContent?.name + ''
                    : clickedContent?.title + ''
                }
                bgImg={getBackgroundImg(clickedContent?.backdrop_path, 'w500')}
              />
            ) : null}
          </AnimatePresence>
        </>
      )}
    </SliderWrapper>
  )
}

export default Slider