import React, { FunctionComponent, memo } from 'react'
import { useStateTracking } from './useStateTracking'

const ProxyHandlers = {
	/**
	 * This is a function call trap for functional components. When this is called, we know it means
	 * React did run 'Component()', that means we can use any hooks here to setup our effect and
	 * store.
	 *
	 * With the native Proxy, all other calls such as access/setting to/of properties will be
	 * forwarded to the target Component, so we don't need to copy the Component's own or inherited
	 * properties.
	 *
	 * @see https://github.com/facebook/react/blob/2d80a0cd690bb5650b6c8a6c079a87b5dc42bd15/packages/react-reconciler/src/ReactFiberHooks.old.js#L460
	 */
	apply(Component: FunctionComponent, thisArg: any, argumentsList: any) {
		return useStateTracking(Component.displayName ?? Component.name ?? 'tracked(???)', () =>
			Component.apply(thisArg, argumentsList)
		)
	},
}

const ReactMemoSymbol = Symbol.for('react.memo')

/**
 * Returns a tracked version of the given component. Any synchronous state dereferences during
 * render will allow tlstate to trigger a rerender when the dereferenced state changes.
 *
 * @param baseComponent
 * @public
 */
export function track<T extends FunctionComponent<any>>(
	baseComponent: T
): T extends React.MemoExoticComponent<any> ? T : React.MemoExoticComponent<T> {
	let compare = null
	if (baseComponent['$$typeof' as keyof typeof baseComponent] === ReactMemoSymbol) {
		baseComponent = (baseComponent as any).type
		compare = (baseComponent as any).compare
	}
	return memo(new Proxy(baseComponent, ProxyHandlers) as any, compare) as any
}