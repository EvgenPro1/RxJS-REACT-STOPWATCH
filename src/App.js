import {useEffect, useState} from "react";
import {BehaviorSubject, interval, Subject} from "rxjs"
import {scan, startWith} from "rxjs/operators"
import {switchMapTo} from "rxjs/_esm2015/internal/operators";

import {Header} from "./client/component/Header/Page";

import './App.css'

const action$ = new Subject()
const stopWatch$ = interval(1000)
    .pipe(
        startWith(0),
        scan(time => time + !!action$.unwait)
    )
const restart = new BehaviorSubject(null);
const restartableTimer$ = restart.pipe(switchMapTo(stopWatch$))

const startFunc = () => {
    if (action$.unwait) {
        stopFunc()
    }
    action$.unwait = 1
    action$.wait = 0
}

const stopFunc = () => {
    if (action$.unwait) {
        restart.next(null)
        setTimeout(() => action$.unwait = 0, 0)
    }
}

const resetFunc = () => {
    action$.wait = 0
    action$.unwait = 1
    restart.next(null)
}

let timer
const waitFunc = () => {
    clearTimeout(timer)
    if (action$.wait !== 2 && action$.unwait) {
        action$.wait += 1
        timer = setTimeout(() => action$.wait = 1 || 0 ? 0 : 2, 300)
    }
    action$.unwait = action$.wait === 1 || 0
}

function App() {
    const [time, setTime] = useState(0)
    useEffect(() => {
        action$.reset = 1 ? action$.reset = 0 : 0
        const timeObserv = restartableTimer$.subscribe(setTime)
        return () => timeObserv.unsubscribe()
    }, [])

    const millisec = time * 1000
    const sec = new Date(millisec).getSeconds()
    const min = new Date(millisec).getMinutes()
    const hour = new Date(millisec).getUTCHours()
    const minutes = min < 10 ? `0${+min}` : min
    const seconds = sec < 10 ? `0${+sec}` : sec
    const hours = hour < 10 ? `0${+hour}` : hour
    const timeDisplay = `${hours} : ${minutes} : ${seconds} `

    return (
        <div className="App">
            <Header/>
            <div>  {timeDisplay} </div>
            <button className="btn" onClick={() => startFunc(time)}>start / stop</button>
            <button className="btn" onClick={() => waitFunc()}>wait</button>
            <button className="btn" onClick={() => resetFunc()}>reset</button>
        </div>
    );
}

export default App;
