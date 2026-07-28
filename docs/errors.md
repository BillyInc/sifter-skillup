
Console Error
View is not defined

The above error occurred in the <AuthScreen> component.

React will try to recreate this component tree from scratch using the error boundary you provided, ErrorBoundary.
Component Stack
38

AuthPage
app/(auth)/index.tsx
WrappedScreenComponent
node_modules/expo-router/build/useScreens.js
BaseRoute
node_modules/expo-router/build/useScreens.js
SceneView
node_modules/@react-navigation/core/lib/module/SceneView.js
render
node_modules/@react-navigation/core/lib/module/useDescriptors.js
routes.reduce$argument_0
node_modules/@react-navigation/core/lib/module/useDescriptors.js
Array.reduce
<anonymous>
useDescriptors
node_modules/@react-navigation/core/lib/module/useDescriptors.js
useNavigationBuilder
node_modules/@react-navigation/core/lib/module/useNavigationBuilder.js
NativeStackNavigator
node_modules/expo-router/build/fork/native-stack/createNativeStackNavigator.js
<anonymous>
node_modules/expo-router/build/layouts/withLayoutContext.js
Object.assign$argument_0
node_modules/expo-router/build/layouts/StackClient.js
AuthLayout
app/(auth)/_layout.tsx
WrappedScreenComponent
node_modules/expo-router/build/useScreens.js
BaseRoute
node_modules/expo-router/build/useScreens.js
SceneView
node_modules/@react-navigation/core/lib/module/SceneView.js
render
node_modules/@react-navigation/core/lib/module/useDescriptors.js
routes.reduce$argument_0
node_modules/@react-navigation/core/lib/module/useDescriptors.js
Array.reduce
<anonymous>
useDescriptors
node_modules/@react-navigation/core/lib/module/useDescriptors.js
useNavigationBuilder
node_modules/@react-navigation/core/lib/module/useNavigationBuilder.js
NativeStackNavigator
node_modules/expo-router/build/fork/native-stack/createNativeStackNavigator.js
<anonymous>
node_modules/expo-router/build/layouts/withLayoutContext.js
Object.assign$argument_0
node_modules/expo-router/build/layouts/StackClient.js
RootLayout
app/_layout.tsx
WrappedScreenComponent
node_modules/expo-router/build/useScreens.js
BaseRoute
node_modules/expo-router/build/useScreens.js
SceneView
node_modules/@react-navigation/core/lib/module/SceneView.js
render
node_modules/@react-navigation/core/lib/module/useDescriptors.js
routes.reduce$argument_0
node_modules/@react-navigation/core/lib/module/useDescriptors.js
Array.reduce
<anonymous>
useDescriptors
node_modules/@react-navigation/core/lib/module/useDescriptors.js
useNavigationBuilder
node_modules/@react-navigation/core/lib/module/useNavigationBuilder.js
Content
node_modules/expo-router/build/ExpoRoot.js
ContextNavigator
node_modules/expo-router/build/ExpoRoot.js
ExpoRoot
node_modules/expo-router/build/ExpoRoot.js
App
node_modules/expo-router/build/qualified-entry.js
WithDevTools
node_modules/expo/src/launch/withDevTools.web.tsx
Call Stack
35

addLog
node_modules/@expo/log-box/src/Data/LogBoxData.tsx
consoleErrorMiddleware
node_modules/@expo/log-box/src/LogBox.ts
console.error
node_modules/@expo/log-box/src/LogBox.ts
defaultOnCaughtError
node_modules/react-dom/cjs/react-dom-client.development.js
logCaughtError
node_modules/react-dom/cjs/react-dom-client.development.js
runWithFiberInDEV
node_modules/react-dom/cjs/react-dom-client.development.js
update.callback
node_modules/react-dom/cjs/react-dom-client.development.js
callCallback
node_modules/react-dom/cjs/react-dom-client.development.js
commitCallbacks
node_modules/react-dom/cjs/react-dom-client.development.js
runWithFiberInDEV
node_modules/react-dom/cjs/react-dom-client.development.js
commitClassCallbacks
node_modules/react-dom/cjs/react-dom-client.development.js
commitLayoutEffectOnFiber
node_modules/react-dom/cjs/react-dom-client.development.js
recursivelyTraverseLayoutEffects
node_modules/react-dom/cjs/react-dom-client.development.js
commitLayoutEffectOnFiber
node_modules/react-dom/cjs/react-dom-client.development.js
recursivelyTraverseLayoutEffects
node_modules/react-dom/cjs/react-dom-client.development.js
commitLayoutEffectOnFiber
node_modules/react-dom/cjs/react-dom-client.development.js
recursivelyTraverseLayoutEffects
node_modules/react-dom/cjs/react-dom-client.development.js
commitLayoutEffectOnFiber
node_modules/react-dom/cjs/react-dom-client.development.js
recursivelyTraverseLayoutEffects
node_modules/react-dom/cjs/react-dom-client.development.js
commitLayoutEffectOnFiber
node_modules/react-dom/cjs/react-dom-client.development.js
recursivelyTraverseLayoutEffects
node_modules/react-dom/cjs/react-dom-client.development.js
commitLayoutEffectOnFiber
node_modules/react-dom/cjs/react-dom-client.development.js
recursivelyTraverseLayoutEffects
node_modules/react-dom/cjs/react-dom-client.development.js
commitLayoutEffectOnFiber
node_modules/react-dom/cjs/react-dom-client.development.js
recursivelyTraverseLayoutEffects
node_modules/react-dom/cjs/react-dom-client.development.js
commitLayoutEffectOnFiber
node_modules/react-dom/cjs/react-dom-client.development.js
recursivelyTraverseLayoutEffects
node_modules/react-dom/cjs/react-dom-client.development.js
commitLayoutEffectOnFiber
node_modules/react-dom/cjs/react-dom-client.development.js
recursivelyTraverseLayoutEffects
node_modules/react-dom/cjs/react-dom-client.development.js
commitLayoutEffectOnFiber
node_modules/react-dom/cjs/react-dom-client.development.js
recursivelyTraverseLayoutEffects
node_modules/react-dom/cjs/react-dom-client.development.js
commitLayoutEffectOnFiber
node_modules/react-dom/cjs/react-dom-client.development.js
recursivelyTraverseLayoutEffects
node_modules/react-dom/cjs/react-dom-client.development.js
commitLayoutEffectOnFiber
node_modules/react-dom/cjs/react-dom-client.development.js
recursivelyTraverseLayoutEffects
node_modules/react-dom/cjs/react-dom-client.development.js --- when i clicked sign in



guest mode failed to fetch

the auth screen is showing the one with the google and apple login instead of the one where you click next, skip and then show login. that is the preferred one.

the entry page is still the same as the previous style. it does not take the shape of the new style at all

the login/sign up placeholders are horribly designed.. it should be as smooth as the new search command centre..


remove the create account with apple and google and default to the previous auth that even allowed entry without the backend running..

the terms and conditions for sign up did not show the pop up.


The action 'GO_BACK' was not handled by any navigator.

Is there any screen to go back to?

This is a development-only warning and won't be shown in production.
Component Stack
4

ContextNavigator
node_modules/expo-router/build/ExpoRoot.js
ExpoRoot
node_modules/expo-router/build/ExpoRoot.js
App
node_modules/expo-router/build/qualified-entry.js
WithDevTools
node_modules/expo/src/launch/withDevTools.web.tsx  --- after i refreshed page in create account page and clicked on go back


View is not defined

The above error occurred in the <AuthScreen> component.

React will try to recreate this component tree from scratch using the error boundary you provided, ErrorBoundary.
Component Stack
38

AuthPage
app/(auth)/index.tsx
WrappedScreenComponent
node_modules/expo-router/build/useScreens.js
BaseRoute
node_modules/expo-router/build/useScreens.js
SceneView
node_modules/@react-navigation/core/lib/module/SceneView.js
render
node_modules/@react-navigation/core/lib/module/useDescriptors.js
routes.reduce$argument_0
node_modules/@react-navigation/core/lib/module/useDescriptors.js
Array.reduce
<anonymous>
useDescriptors
node_modules/@react-navigation/core/lib/module/useDescriptors.js
useNavigationBuilder
node_modules/@react-navigation/core/lib/module/useNavigationBuilder.js
NativeStackNavigator
node_modules/expo-router/build/fork/native-stack/createNativeStackNavigator.js
<anonymous>
node_modules/expo-router/build/layouts/withLayoutContext.js
Object.assign$argument_0
node_modules/expo-router/build/layouts/StackClient.js
AuthLayout
app/(auth)/_layout.tsx
WrappedScreenComponent
node_modules/expo-router/build/useScreens.js
BaseRoute
node_modules/expo-router/build/useScreens.js
SceneView
node_modules/@react-navigation/core/lib/module/SceneView.js
render
node_modules/@react-navigation/core/lib/module/useDescriptors.js
routes.reduce$argument_0
node_modules/@react-navigation/core/lib/module/useDescriptors.js
Array.reduce
<anonymous>
useDescriptors
node_modules/@react-navigation/core/lib/module/useDescriptors.js
useNavigationBuilder
node_modules/@react-navigation/core/lib/module/useNavigationBuilder.js
NativeStackNavigator
node_modules/expo-router/build/fork/native-stack/createNativeStackNavigator.js
<anonymous>
node_modules/expo-router/build/layouts/withLayoutContext.js
Object.assign$argument_0
node_modules/expo-router/build/layouts/StackClient.js
RootLayout
app/_layout.tsx
WrappedScreenComponent
node_modules/expo-router/build/useScreens.js
BaseRoute
node_modules/expo-router/build/useScreens.js
SceneView
node_modules/@react-navigation/core/lib/module/SceneView.js
render
node_modules/@react-navigation/core/lib/module/useDescriptors.js
routes.reduce$argument_0
node_modules/@react-navigation/core/lib/module/useDescriptors.js
Array.reduce
<anonymous>
useDescriptors
node_modules/@react-navigation/core/lib/module/useDescriptors.js
useNavigationBuilder
node_modules/@react-navigation/core/lib/module/useNavigationBuilder.js
Content
node_modules/expo-router/build/ExpoRoot.js
ContextNavigator
node_modules/expo-router/build/ExpoRoot.js
ExpoRoot
node_modules/expo-router/build/ExpoRoot.js
App
node_modules/expo-router/build/qualified-entry.js
WithDevTools
node_modules/expo/src/launch/withDevTools.web.tsx
Call Stack
35 --- when you click sign in from anywhere..


 python main.py
Traceback (most recent call last):
  File "C:\Users\USER\Documents\sifter-skillup-integrated\backend\main.py", line 19, in <module>
    from middleware.session_middleware import DeviceSessionMiddleware
  File "C:\Users\USER\Documents\sifter-skillup-integrated\backend\middleware\session_middleware.py", line 23, in <module>
    from device_sessions import validate_device_header
  File "C:\Users\USER\Documents\sifter-skillup-integrated\backend\device_sessions.py", line 26, in <module>
    router = APIRouter(prefix="/api/devices", tags=["devices"])
  File "C:\Users\USER\AppData\Roaming\Python\Python314\site-packages\fastapi\routing.py", line 787, in __init__
    super().__init__(
    ~~~~~~~~~~~~~~~~^
        routes=routes,
        ^^^^^^^^^^^^^^
    ...<4 lines>...
        lifespan=lifespan,
        ^^^^^^^^^^^^^^^^^^
    )
    ^
TypeError: Router.__init__() got an unexpected keyword argument 'on_startup'
PS C:\Users\USER\Documents\sifter-skillup-integrated\backend>  --- when i tried to start the backend... 





SO SPECIFICALLY FOR THE ENTRY PAGE, THERE WAS A PREVIOUS ONE WHERE YOU HAD TO CLICK NEXT, AND THEN EVENTUALLY GET TO THE AUTH PAGE WHERE YOU SEE ONLY EMAIL SIGN UP AND A GUEST MODE ENTRY WHICH WORKED.. THIS CURRENT VERSION WAS THE DUPLICATE WHICH WAS SUPPOSED TO BE SHELVED FOR THE PREVIOUS ONE. I WANT THAT PREVIOUS ONE BACK.. THE ONE WHERE YOU HAD TO TRANSITION BEFORE GETTING TO THE AUTH PAGE



