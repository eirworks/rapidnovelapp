# Status Bar

The status bar is a global notification system that appears at the bottom-center of
every page. Messages are **queued**: one is shown at a time, and every **3 seconds** the
next queued message replaces the current one. If the queue runs out, the currently
displayed message stays (it is never removed just because the timer ticked).

Each message has a **severity** (which controls the color of a small dot before the text)
and a **message** (the plain text, which is not colored).

## Files

| File | Purpose |
| --- | --- |
| `src/store/statusBar.ts` | Pinia store holding the queue, the current message, and the tick timer. |
| `src/components/StatusBar.vue` | The UI component rendered at the bottom of every page. |
| `src/libs/models/StatusMessage.ts` | The `StatusMessage` interface and `StatusSeverity` type. |
| `src/App.vue` | Mounts `<StatusBar />` so it appears on every route. |

## Severities & colors

| Severity | Dot color |
| --- | --- |
| `success` | green (`bg-emerald-500`) |
| `danger` | red (`bg-red-500`) |
| `warning` | amber (`bg-amber-500`) |
| `info` | blue (`bg-sky-500`) |

The dot renders before the message text; the text itself stays uncolored.

## Usage

### 1. Show a message

Get the store and call one of the severity helpers. The first message shows
immediately; any further messages are queued and shown every 3 seconds.

```ts
import { useStatusBarStore } from '../store/statusBar'

const statusBar = useStatusBarStore()

statusBar.success('Project saved')
statusBar.danger('Something went wrong')
statusBar.warning('Disk space is low')
statusBar.info('Build finished in 12s')
```

### 2. Enqueue a message with a severity (generic)

```ts
statusBar.enqueue({ severity: 'info', message: 'Data synced' })
```

### 3. Manually advance the queue (optional)

```ts
statusBar.next() // show the next queued message now
```

### 4. Control the timer

The component starts the timer on mount and stops it on unmount, so you normally
don't need to touch these. They are exposed if you need manual control.

```ts
statusBar.start() // begin the 3s tick
statusBar.stop()  // stop the 3s tick
```

## API reference

`useStatusBarStore()` — Pinia store.

### State

| Property | Type | Description |
| --- | --- | --- |
| `queue` | `StatusMessage[]` | Messages waiting to be shown. |
| `current` | `StatusMessage \| null` | The message currently displayed. `null` when nothing has been shown yet. |

### Actions

| Function | Signature | Description |
| --- | --- | --- |
| `enqueue` | `(item: StatusMessage) => void` | Adds a message. Shows it immediately if nothing is displayed, otherwise queues it. |
| `success` | `(message: string) => void` | Enqueues a `success` message. |
| `danger` | `(message: string) => void` | Enqueues a `danger` message. |
| `warning` | `(message: string) => void` | Enqueues a `warning` message. |
| `info` | `(message: string) => void` | Enqueues an `info` message. |
| `next` | `() => void` | Replaces the current message with the next queued one (keeps it if the queue is empty). |
| `start` | `() => void` | Starts the 3-second tick. |
| `stop` | `() => void` | Stops the 3-second tick. |

### Types

```ts
type StatusSeverity = 'success' | 'danger' | 'warning' | 'info'

interface StatusMessage {
  severity: StatusSeverity
  message: string
}
```

## Behavior notes

- **Empty queue keeps the text:** on a tick, if `queue` is empty the current message
  remains visible — it is not cleared.
- **First message is immediate:** calling `enqueue`/`success`/etc. when nothing is shown
  displays the message right away instead of waiting for the first 3s tick.
- The bar is hidden while there is no current message.
