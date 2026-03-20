import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { getStrapiImageUrl } from '../utils/helpers'

function renderInlineChildren(children = []) {
  return children.map((child, i) => {
    if (child.type === 'link') {
      const isImg = /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(child.url)
      if (isImg) {
        return (
          <div key={i} className="my-10 w-full">
            <img 
               src={child.url} 
               style={{ width: '100%', borderRadius: '20px', maxHeight: '520px', objectFit: 'cover', display: 'block', border: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 12px 64px rgba(0,0,0,0.65)' }} 
            />
          </div>
        )
      }
      return (
        <a
          key={i}
          href={child.url}
          className="text-purple-400 underline hover:text-purple-300"
          target="_blank"
          rel="noopener noreferrer"
        >
          {renderInlineChildren(child.children)}
        </a>
      )
    }
    const text = child.text || ''
    if (child.bold)   return <strong key={i}>{text}</strong>
    if (child.italic) return <em key={i}>{text}</em>
    if (child.code)   return <code key={i} className="bg-dark-200 px-1.5 py-0.5 rounded text-sm font-mono text-purple-300">{text}</code>
    return <span key={i}>{text}</span>
  })
}

function renderBlock(block, index) {
  switch (block.type) {
    case 'heading': {
      const Tag = `h${block.level}`
      const cls = {
        1: 'text-3xl font-serif font-normal text-white mt-10 mb-4',
        2: 'text-2xl font-serif font-normal text-white mt-8 mb-3',
        3: 'text-xl font-medium text-white mt-6 mb-2',
        4: 'text-lg font-medium text-gray-200 mt-4 mb-2',
      }[block.level] || 'text-lg text-white mt-4 mb-2'
      return (
        <Tag key={index} className={cls}>
          {renderInlineChildren(block.children)}
        </Tag>
      )
    }

    case 'paragraph':
      return (
        <p key={index} className="text-gray-300 leading-7 mb-4">
          {renderInlineChildren(block.children)}
        </p>
      )

    case 'list': {
      const Tag = block.format === 'ordered' ? 'ol' : 'ul'
      const cls =
        block.format === 'ordered'
          ? 'list-decimal list-inside mb-4 space-y-1.5 text-gray-300 pl-2'
          : 'list-disc list-inside mb-4 space-y-1.5 text-gray-300 pl-2'
      return (
        <Tag key={index} className={cls}>
          {block.children.map((item, j) => (
            <li key={j} className="leading-7">
              {renderInlineChildren(item.children)}
            </li>
          ))}
        </Tag>
      )
    }

    case 'code':
      return (
        <pre key={index} className="bg-dark-200 border border-dark-400 rounded-xl p-4 mb-4 overflow-x-auto">
          <code className="text-sm font-mono text-green-400 whitespace-pre">
            {block.children?.[0]?.text || ''}
          </code>
        </pre>
      )

    case 'quote':
      return (
        <blockquote
          key={index}
          className="border-l-4 border-purple-500 pl-4 my-4 text-gray-400 italic"
        >
          {renderInlineChildren(block.children)}
        </blockquote>
      )

    case 'image': {
      const imgUrl = block.image?.url || block.imageUrl
      if (!imgUrl) return null
      return (
        <div key={index} className="my-10 w-full">
          <img
            src={getStrapiImageUrl(block.image) || imgUrl}
            alt={block.alt || 'Visual'}
            style={{
              width: '100%',
              borderRadius: '20px',
              maxHeight: '520px',
              objectFit: 'cover',
              display: 'block',
              border: '1px solid rgba(255,255,255,0.06)',
              boxShadow: '0 12px 64px rgba(0,0,0,0.65), 0 4px 12px rgba(0,0,0,0.45)',
            }}
            onError={(e) => { e.currentTarget.parentElement.style.display = 'none'; }}
          />
          {(block.alt || block.caption) && (
             <p className="mt-3 text-center text-[10px] text-gray-500 font-mono uppercase tracking-widest opacity-60">
                {block.alt || block.caption}
             </p>
          )}
        </div>
      )
    }

    default:
      return (
        <div key={index} className="text-gray-300 mb-3">
          {renderInlineChildren(block.children || [])}
        </div>
      )
  }
}

export default function BlogContentRenderer({ content }) {
  if (!content) {
    return (
      <div className="text-gray-500 text-sm italic py-8 text-center">
        No content available.
      </div>
    )
  }

  if (Array.isArray(content)) {
    if (content.length === 0) {
      return (
        <div className="text-gray-500 text-sm italic py-8 text-center">
          No content available.
        </div>
      )
    }
    return (
      <div className="blog-prose max-w-none">
        {content.map((block, i) => renderBlock(block, i))}
      </div>
    )
  }

  if (typeof content === 'string') {
    return (
      <div className="blog-prose max-w-none">
        <ReactMarkdown 
          remarkPlugins={[remarkGfm]}
          components={{
            img: ({node, ...props}) => (
              <div className="my-10 w-full">
                <img
                  {...props}
                  style={{
                    width: '100%',
                    borderRadius: '20px',
                    maxHeight: '520px',
                    objectFit: 'cover',
                    display: 'block',
                    border: '1px solid rgba(255,255,255,0.06)',
                    boxShadow: '0 12px 64px rgba(0,0,0,0.65), 0 4px 12px rgba(0,0,0,0.45)',
                  }}
                  onLoad={(e) => {
                    // Optional: Fade in on load for extra wow factor
                    e.currentTarget.style.opacity = '1';
                  }}
                  onError={(e) => {
                    // Hide if image fails to load
                    e.currentTarget.parentElement.style.display = 'none';
                  }}
                />
                {props.alt && props.alt !== 'alt' && (
                   <p className="mt-3 text-center text-[10px] text-gray-500 font-mono uppercase tracking-widest opacity-60">
                     {props.alt}
                   </p>
                )}
              </div>
            ),
            // Ensure headers and paragraphs match the premium design system
            h2: ({node, ...props}) => <h2 className="text-2xl font-serif text-white mt-12 mb-4" {...props} />,
            p: ({node, ...props}) => <p className="text-gray-300 leading-relaxed mb-6" {...props} />,
            a: ({node, ...props}) => {
               const isImg = /\.(jpg|jpeg|png|webp|gif|svg)(\?.*)?$/i.test(props.href || '')
               if (isImg) {
                  return (
                     <div className="my-10 w-full">
                       <img 
                          src={props.href} 
                          alt={props.children}
                          style={{ width: '100%', borderRadius: '20px', maxHeight: '520px', objectFit: 'cover', display: 'block', border: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 12px 64px rgba(0,0,0,0.65)' }} 
                       />
                     </div>
                  )
               }
               return <a className="text-purple-400 underline hover:text-purple-300" {...props} target="_blank" rel="noopener noreferrer" />
            }
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    )
  }

  return (
    <div className="text-gray-500 text-sm italic">
      Content format not recognized.
    </div>
  )
}
