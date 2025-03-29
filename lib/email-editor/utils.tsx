import { v4 as uuidv4 } from "uuid"
import type {
  EmailBlock,
  BlockType,
  HeaderBlock,
  TextBlock,
  ImageBlock,
  ButtonBlock,
  DividerBlock,
  SpacerBlock,
  ColumnsBlock,
} from "./components"

// 新しいブロックを作成する関数
export function createBlock(type: BlockType): EmailBlock {
  const id = uuidv4()

  switch (type) {
    case "header":
      return {
        id,
        type: "header",
        content: "見出しテキスト",
        level: 2,
        align: "left",
        color: "#000000",
      } as HeaderBlock

    case "text":
      return {
        id,
        type: "text",
        content: "ここにテキストを入力してください。",
        align: "left",
        color: "#000000",
      } as TextBlock

    case "image":
      return {
        id,
        type: "image",
        src: "https://via.placeholder.com/600x300",
        alt: "画像の説明",
        width: "100%",
        align: "center",
      } as ImageBlock

    case "button":
      return {
        id,
        type: "button",
        text: "ボタン",
        link: "https://example.com",
        backgroundColor: "#007bff",
        textColor: "#ffffff",
        align: "center",
        fullWidth: false,
      } as ButtonBlock

    case "divider":
      return {
        id,
        type: "divider",
        color: "#cccccc",
        style: "solid",
      } as DividerBlock

    case "spacer":
      return {
        id,
        type: "spacer",
        height: 20,
      } as SpacerBlock

    case "columns":
      return {
        id,
        type: "columns",
        columns: 2,
        blocks: [[], []],
      } as ColumnsBlock

    default:
      throw new Error(`Unknown block type: ${type}`)
  }
}

// HTMLに変換する関数
export function blocksToHtml(blocks: EmailBlock[]): string {
  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Email</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333333;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        img {
          max-width: 100%;
          height: auto;
        }
        .button {
          display: inline-block;
          padding: 10px 20px;
          text-decoration: none;
          border-radius: 4px;
          font-weight: bold;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="container">
  `

  blocks.forEach((block) => {
    html += blockToHtml(block)
  })

  html += `
      </div>
    </body>
    </html>
  `

  return html
}

// 個別のブロックをHTMLに変換
function blockToHtml(block: EmailBlock): string {
  switch (block.type) {
    case "header": {
      const { content, level, align, color } = block as HeaderBlock
      return `<h${level} style="color: ${color}; text-align: ${align};">${content}</h${level}>`
    }

    case "text": {
      const { content, align, color } = block as TextBlock
      return `<p style="color: ${color}; text-align: ${align};">${content}</p>`
    }

    case "image": {
      const { src, alt, width, align, link } = block as ImageBlock
      const imgTag = `<img src="${src}" alt="${alt}" style="width: ${width}; max-width: 100%;" />`
      const alignStyle = `text-align: ${align};`

      if (link) {
        return `<div style="${alignStyle}"><a href="${link}" target="_blank">${imgTag}</a></div>`
      }
      return `<div style="${alignStyle}">${imgTag}</div>`
    }

    case "button": {
      const { text, link, backgroundColor, textColor, align, fullWidth } = block as ButtonBlock
      const width = fullWidth ? "width: 100%;" : ""
      const alignStyle = `text-align: ${align};`

      return `
        <div style="${alignStyle}">
          <a href="${link}" class="button" target="_blank" style="background-color: ${backgroundColor}; color: ${textColor}; ${width}">
            ${text}
          </a>
        </div>
      `
    }

    case "divider": {
      const { color, style } = block as DividerBlock
      return `<hr style="border: none; border-top: 1px ${style} ${color}; margin: 20px 0;" />`
    }

    case "spacer": {
      const { height } = block as SpacerBlock
      return `<div style="height: ${height}px;"></div>`
    }

    case "columns": {
      const { blocks } = block as ColumnsBlock
      let columnsHtml = '<div style="display: table; width: 100%; table-layout: fixed;">'

      blocks.forEach((columnBlocks) => {
        columnsHtml += '<div style="display: table-cell; padding: 0 10px;">'
        columnBlocks.forEach((innerBlock) => {
          columnsHtml += blockToHtml(innerBlock)
        })
        columnsHtml += "</div>"
      })

      columnsHtml += "</div>"
      return columnsHtml
    }

    default:
      return ""
  }
}

