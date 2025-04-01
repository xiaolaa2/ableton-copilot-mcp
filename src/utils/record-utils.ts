import { Result } from './common.js'
import { Song } from 'ableton-js/ns/song.js'
import { Mutex } from 'async-mutex'
import { logger } from '../main.js'

const removeListenerFuncs: (() => Promise<boolean | undefined>)[] = []
const mutex = new Mutex()

/**
 * Sets up a listener for the record mode of the song.
 * When the record mode is set to false, all listeners are removed to prevent bugs when recording is stopped by user.
 */
export async function setupRecordModeListener(song: Song) {
    song.addListener('record_mode', async (mode: any) => {
        if (!mode) {
            // remove all listeners
            const release = await mutex.acquire()
            try {
                for (const removeFunc of removeListenerFuncs) {
                    await removeFunc()
                }
                logger.info(`remove ${removeListenerFuncs.length} listeners in record mode listener`)
                // clear the array
                removeListenerFuncs.length = 0
            } catch (err) {
                logger.error(err)
            } finally {
                release()
            }
        }
    })
}

export async function recordByTimeRange(song: Song, start_time: number, end_time: number) {
    await song.set('start_time' as any, start_time)
    await song.set('record_mode', 1)
    return new Promise<string>((resolve, reject) => {
        let removeFunc: (() => Promise<boolean | undefined>) | undefined
        song.addListener('current_song_time', async (time) => {
            try {
                if (time >= end_time) {
                    // remove this listener
                    if (removeFunc) {
                        const release = await mutex.acquire()
                        try {
                            if (removeListenerFuncs.includes(removeFunc)) {
                                await removeFunc()
                                // remove from array
                                removeListenerFuncs.splice(removeListenerFuncs.indexOf(removeFunc), 1)
                                logger.info('remove listener in record_by_time_range')
                            }
                        } finally {
                            release()
                        }
                    }
                    await song.set('record_mode', 0)
                    await song.stopPlaying()
                    resolve(Result.ok())
                }
            } catch (err) {
                if (removeFunc) {
                    const release = await mutex.acquire()
                    try {
                        if (removeListenerFuncs.includes(removeFunc)) {
                            await removeFunc()
                            // remove from array
                            removeListenerFuncs.splice(removeListenerFuncs.indexOf(removeFunc), 1)
                            logger.info('remove listener in record_by_time_range')
                        }
                    } finally {
                        release()
                    }
                }
                reject(`record_by_time_range failed: ${err}`)
            }
        }).then(async listenerRemoveFunc => {
            removeFunc = listenerRemoveFunc
            const release = await mutex.acquire()
            try {
                removeListenerFuncs.push(listenerRemoveFunc)
            } finally {
                release()
            }
        }).catch(err => {
            logger.error(err)
            resolve('record_by_time_range failed')
        })
    })
}