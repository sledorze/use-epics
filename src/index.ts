import {useMemo, useReducer, useEffect, useRef, useState} from "react"
import {
    BehaviorSubject,
    Subject,
    queueScheduler,
    Observable,
    Subscription
} from "rxjs"
import {observeOn, distinctUntilChanged, filter} from "rxjs/operators"

// tslint:disable:variable-name
export class StateObservable<S> extends Observable<S> {
    value: S
    __notifier: Subject<S>
    __subscription: Subscription
    constructor(stateSubject: Subject<S>, initialState: S) {
        super(subscriber => {
            const subscription = this.__notifier.subscribe(subscriber)
            if (subscription && !subscription.closed) {
                subscriber.next(this.value)
            }
            return subscription
        })

        this.value = initialState
        this.__notifier = new Subject()
        this.__subscription = stateSubject.subscribe(value => {
            if (value !== this.value) {
                this.value = value
                this.__notifier.next(value)
            }
        })
    }
}

export type StateAndCallbacksFor<A extends Actions> = [
    StateFor<A>,
    CallbacksFor<A>
]

export type StateFor<A extends Actions> = A extends Actions<infer S, any>
    ? S
    : never

export type CallbacksFor<A extends Actions> = A extends Actions<any, infer R>
    ? {
          [T in ActionUnion<R>["type"]]: (
              ...payload: ActionByType<ActionUnion<R>, T>["payload"]
          ) => void
      }
    : never

export type Actions<S = any, R extends ActionRecordBase<S> = any> = (
    state: S
) => R

export type ActionRecordBase<S = any> = Record<
    string,
    (...args: any[]) => S extends object ? S | void : S
>

export type ActionUnion<R extends ActionRecordBase> = {
    [T in keyof R]: {type: T; payload: Parameters<R[T]>}
}[keyof R]

export type ActionByType<A, T> = A extends {type: infer T2}
    ? (T extends T2 ? A : never)
    : never

export declare interface Epic<S, R extends ActionRecordBase<S>, Output = any> {
    (
        action$: Observable<ActionUnion<R>>,
        state$: StateObservable<S>,
        actions: CallbacksFor<Actions<S, R>>
    ): Observable<Output>
}

type Initializer<S, I> = (arg: I) => S

export declare interface Options<I = any, S = any> {
    immer?: boolean
    init?: Initializer<S, I>
}

const defaultOptions = {
    immer: true,
    init: undefined
}

export function useEpics<S, R extends ActionRecordBase<S>>(
    createActions: Actions<S, R>,
    initialState: S,
    epics: Epic<S, R>[],
    options?: Options<S>
): StateAndCallbacksFor<Actions<S, R>>
export function useEpics<S, R extends ActionRecordBase<S>, I>(
    createActions: Actions<S, R>,
    initializerArg: I,
    epics: Epic<S, R>[],
    options?: Options<I, S>
): StateAndCallbacksFor<Actions<S, R>>
export function useEpics<S, R extends ActionRecordBase<S>, I = S>(
    createActions: Actions<S, R>,
    initialState: any,
    epics: Epic<S, R>[] = [],
    options: Options<any, S> = {}
): StateAndCallbacksFor<Actions<S, R>> {
    let stateRef$ = useRef<BehaviorSubject<S> | null>(null)
    let actionRef$ = useRef<Subject<ActionUnion<R>> | null>(null)
    const [lastAction, setLastAction] = useState<ActionUnion<R> | null>(null)
    let wrappedActions: CallbacksFor<typeof createActions> | undefined

    const opts = Object.assign(defaultOptions, options)

    const reducer = useMemo(() => {
        const update = (state: S, action: ActionUnion<R>) =>
            createActions(state)[action.type](action.payload)
        return !opts.immer ? update : require("immer").default(update)
    }, [createActions])

    const [state, dispatch] = useReducer(reducer, initialState, opts.init)

    useEffect(() => {
        const initializedState = (opts.init
            ? (opts.init as any)(initialState)
            : initialState) as S
        stateRef$.current = new BehaviorSubject(initializedState).pipe(
            observeOn(queueScheduler),
            distinctUntilChanged()
        ) as BehaviorSubject<S>
        actionRef$.current = new Subject()

        const state$ = new StateObservable(stateRef$.current, initializedState)

        const epics$ = epics.map(epic =>
            epic(
                actionRef$.current as Observable<ActionUnion<R>>,
                state$,
                wrappedActions as CallbacksFor<typeof createActions>
            )
        )

        const effectSubscriptions$ = epics$.map(e => e.subscribe())

        return () => effectSubscriptions$.forEach(e => e.unsubscribe())
    }, [epics])

    const actionTypes: ActionUnion<R>["type"][] = Object.keys(
        createActions(initialState)
    )

    wrappedActions = useMemo(
        () =>
            actionTypes.reduce(
                (acc, type) => {
                    const dispatchWithEpic = ([payload]: any) => {
                        const action = {type, payload} as ActionUnion<R>
                        const nextState = reducer(state, action)
                        // while an action that returns undefined is not dispatched,
                        // is is pushed into the epic to trigger side-effects
                        nextState !== undefined && dispatch(action)
                        setLastAction(action)
                    }
                    acc[type] = (...payload) => dispatchWithEpic(payload)
                    return acc
                },
                {} as CallbacksFor<typeof createActions>
            ),
        actionTypes
    )

    useEffect(() => {
        if (lastAction && stateRef$.current && actionRef$.current) {
            stateRef$.current.next(state as S)
            actionRef$.current.next(lastAction as any)
            setLastAction(null)
        }
    }, [lastAction, stateRef$.current, actionRef$.current])

    return [state as S, wrappedActions]
}

type Action = {type?: string; [key: string]: any}

export declare function ofTypeOperator<
    T extends Action,
    R extends T = T,
    K extends R["type"] = R["type"]
>(...key: K[]): (source: Observable<T>) => Observable<R>

export const ofType = <T extends Action>(...keys: string[]) => (
    source: Observable<T>
): Observable<any> =>
    source.pipe(
        filter(action => {
            if (!action) return false
            const {type} = action
            const len = keys.length

            if (len === 1) {
                return type === keys[0]
            } else {
                for (let i = 0; i < len; i++) {
                    if (type === keys[i]) {
                        return true
                    }
                }
            }
            return false
        })
    )
