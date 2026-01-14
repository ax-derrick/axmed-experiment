# Metabase Implementation Details

## Iframe Component
The dashboard utilizes a standard `iframe` to embed Metabase charts. It handles a loading state and uses a ref for resizing.

```tsx
<div style={{ position: 'relative', minHeight: 400, borderRadius: 8, overflow: 'hidden' }}>
  {iframeLoading && (
    <div className="iframe-loading">
      <Spin size="large" />
    </div>
  )}
  <iframe
    ref={iframeRef}
    key={dataView}
    src={iframeUrl}
    width="100%"
    style={{ border: 'none', display: 'block', minHeight: 400, borderRadius: 8 }}
    onLoad={handleIframeLoad}
    title="Analytics Dashboard"
  />
</div>
```

## Configuration Variables
We use two types of URLs: Public and Signed (JWT).

**Public Dashboard (Buyer)**:
```typescript
const PROCUREMENT_OVERVIEW_URL =
  'https://axmed.metabaseapp.com/public/dashboard/e32a226c-b319-42e4-a640-a48e3b2ddbb5#titled=false&downloads=false';
```

**Signed Dashboard (Supplier)**:
The supplier dashboard uses a JWT to secure the embed. 

```typescript
// Example Signed URL (Tokens have expiration)
const MARKETPLACE_IFRAME_URL =
  'https://axmed.metabaseapp.com/embed/dashboard/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyZXNvdXJjZSI6eyJkYXNoYm9hcmQiOjE4NDl9LCJwYXJhbXMiOnt9LCJleHAiOjE3NjQ5Mzk2MjMsImlhdCI6MTc2NDMzNDgyMn0.J1RtFbwp15EP5mCdDJs77HpVGZYmt6s1Wt8AeDvXtR8#bordered=false&titled=false&refresh=3600&downloads=false';
```

## Resizing Script
To ensure the iframe adapts to the content size, we inject the Metabase Resizer script dynamically.

```typescript
const METABASE_RESIZER_URL = 'https://axmed.metabaseapp.com/app/iframeResizer.js';

// Logic to inject script
useEffect(() => {
  const existingScript = document.querySelector(`script[src="${METABASE_RESIZER_URL}"]`);
  if (!existingScript) {
    const script = document.createElement('script');
    script.src = METABASE_RESIZER_URL;
    script.async = true;
    document.body.appendChild(script);
  }
}, []);
```

## Resizer Initialization
When the iframe loads, we trigger the resize function.

```typescript
const handleIframeLoad = () => {
    setIframeLoading(false);
    if (iframeRef.current && (window as any).iFrameResize) {
      (window as any).iFrameResize({}, iframeRef.current);
    }
};
```
