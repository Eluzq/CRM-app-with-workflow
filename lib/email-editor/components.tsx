"use client"

import { useState } from "react"
import { Trash2, Move, Edit, Plus, Image, Type, Link, Grid, Columns, AlignLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

// エディタで使用するブロックタイプ
export type BlockType = "header" | "text" | "image" | "button" | "divider" | "spacer" | "columns"

// 各ブロックの共通プロパティ
interface BaseBlock {
  id: string
  type: BlockType
}

// ヘッダーブロック
export interface HeaderBlock extends BaseBlock {
  type: "header"
  content: string
  level: 1 | 2 | 3
  align: "left" | "center" | "right"
  color: string
}

// テキストブロック
export interface TextBlock extends BaseBlock {
  type: "text"
  content: string
  align: "left" | "center" | "right"
  color: string
}

// 画像ブロック
export interface ImageBlock extends BaseBlock {
  type: "image"
  src: string
  alt: string
  width: string
  align: "left" | "center" | "right"
  link?: string
}

// ボタンブロック
export interface ButtonBlock extends BaseBlock {
  type: "button"
  text: string
  link: string
  backgroundColor: string
  textColor: string
  align: "left" | "center" | "right"
  fullWidth: boolean
}

// 区切り線ブロック
export interface DividerBlock extends BaseBlock {
  type: "divider"
  color: string
  style: "solid" | "dashed" | "dotted"
}

// スペーサーブロック
export interface SpacerBlock extends BaseBlock {
  type: "spacer"
  height: number
}

// カラムブロック
export interface ColumnsBlock extends BaseBlock {
  type: "columns"
  columns: number
  blocks: EmailBlock[][]
}

// すべてのブロックタイプの共用体型
export type EmailBlock = HeaderBlock | TextBlock | ImageBlock | ButtonBlock | DividerBlock | SpacerBlock | ColumnsBlock

// ブロックのプロパティエディタのプロップス
interface BlockEditorProps {
  block: EmailBlock
  onChange: (updatedBlock: EmailBlock) => void
}

// ヘッダーブロックエディタ
export function HeaderBlockEditor({ block, onChange }: BlockEditorProps) {
  const headerBlock = block as HeaderBlock

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="header-content">見出しテキスト</Label>
        <Textarea
          id="header-content"
          value={headerBlock.content}
          onChange={(e) => onChange({ ...headerBlock, content: e.target.value })}
          rows={2}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="header-level">見出しレベル</Label>
          <Select
            value={headerBlock.level.toString()}
            onValueChange={(value) => onChange({ ...headerBlock, level: Number.parseInt(value) as 1 | 2 | 3 })}
          >
            <SelectTrigger id="header-level">
              <SelectValue placeholder="レベルを選択" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">大見出し (H1)</SelectItem>
              <SelectItem value="2">中見出し (H2)</SelectItem>
              <SelectItem value="3">小見出し (H3)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="header-align">配置</Label>
          <Select
            value={headerBlock.align}
            onValueChange={(value) => onChange({ ...headerBlock, align: value as "left" | "center" | "right" })}
          >
            <SelectTrigger id="header-align">
              <SelectValue placeholder="配置を選択" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="left">左揃え</SelectItem>
              <SelectItem value="center">中央揃え</SelectItem>
              <SelectItem value="right">右揃え</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="header-color">テキスト色</Label>
        <div className="flex items-center gap-2">
          <Input
            id="header-color"
            type="color"
            value={headerBlock.color}
            onChange={(e) => onChange({ ...headerBlock, color: e.target.value })}
            className="w-12 h-8 p-1"
          />
          <Input
            type="text"
            value={headerBlock.color}
            onChange={(e) => onChange({ ...headerBlock, color: e.target.value })}
            className="flex-1"
          />
        </div>
      </div>
    </div>
  )
}

// テキストブロックエディタ
export function TextBlockEditor({ block, onChange }: BlockEditorProps) {
  const textBlock = block as TextBlock

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="text-content">テキスト内容</Label>
        <Textarea
          id="text-content"
          value={textBlock.content}
          onChange={(e) => onChange({ ...textBlock, content: e.target.value })}
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="text-align">配置</Label>
        <Select
          value={textBlock.align}
          onValueChange={(value) => onChange({ ...textBlock, align: value as "left" | "center" | "right" })}
        >
          <SelectTrigger id="text-align">
            <SelectValue placeholder="配置を選択" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="left">左揃え</SelectItem>
            <SelectItem value="center">中央揃え</SelectItem>
            <SelectItem value="right">右揃え</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="text-color">テキスト色</Label>
        <div className="flex items-center gap-2">
          <Input
            id="text-color"
            type="color"
            value={textBlock.color}
            onChange={(e) => onChange({ ...textBlock, color: e.target.value })}
            className="w-12 h-8 p-1"
          />
          <Input
            type="text"
            value={textBlock.color}
            onChange={(e) => onChange({ ...textBlock, color: e.target.value })}
            className="flex-1"
          />
        </div>
      </div>
    </div>
  )
}

// 画像ブロックエディタ
export function ImageBlockEditor({ block, onChange }: BlockEditorProps) {
  const imageBlock = block as ImageBlock

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="image-src">画像URL</Label>
        <Input
          id="image-src"
          value={imageBlock.src}
          onChange={(e) => onChange({ ...imageBlock, src: e.target.value })}
          placeholder="https://example.com/image.jpg"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="image-alt">代替テキスト</Label>
        <Input
          id="image-alt"
          value={imageBlock.alt}
          onChange={(e) => onChange({ ...imageBlock, alt: e.target.value })}
          placeholder="画像の説明"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="image-width">幅</Label>
          <Input
            id="image-width"
            value={imageBlock.width}
            onChange={(e) => onChange({ ...imageBlock, width: e.target.value })}
            placeholder="100%"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="image-align">配置</Label>
          <Select
            value={imageBlock.align}
            onValueChange={(value) => onChange({ ...imageBlock, align: value as "left" | "center" | "right" })}
          >
            <SelectTrigger id="image-align">
              <SelectValue placeholder="配置を選択" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="left">左揃え</SelectItem>
              <SelectItem value="center">中央揃え</SelectItem>
              <SelectItem value="right">右揃え</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="image-link">リンク先URL (オプション)</Label>
        <Input
          id="image-link"
          value={imageBlock.link || ""}
          onChange={(e) => onChange({ ...imageBlock, link: e.target.value })}
          placeholder="https://example.com"
        />
      </div>
    </div>
  )
}

// ボタンブロックエディタ
export function ButtonBlockEditor({ block, onChange }: BlockEditorProps) {
  const buttonBlock = block as ButtonBlock

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="button-text">ボタンテキスト</Label>
        <Input
          id="button-text"
          value={buttonBlock.text}
          onChange={(e) => onChange({ ...buttonBlock, text: e.target.value })}
          placeholder="ここをクリック"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="button-link">リンク先URL</Label>
        <Input
          id="button-link"
          value={buttonBlock.link}
          onChange={(e) => onChange({ ...buttonBlock, link: e.target.value })}
          placeholder="https://example.com"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="button-bg-color">背景色</Label>
          <div className="flex items-center gap-2">
            <Input
              id="button-bg-color"
              type="color"
              value={buttonBlock.backgroundColor}
              onChange={(e) => onChange({ ...buttonBlock, backgroundColor: e.target.value })}
              className="w-12 h-8 p-1"
            />
            <Input
              type="text"
              value={buttonBlock.backgroundColor}
              onChange={(e) => onChange({ ...buttonBlock, backgroundColor: e.target.value })}
              className="flex-1"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="button-text-color">テキスト色</Label>
          <div className="flex items-center gap-2">
            <Input
              id="button-text-color"
              type="color"
              value={buttonBlock.textColor}
              onChange={(e) => onChange({ ...buttonBlock, textColor: e.target.value })}
              className="w-12 h-8 p-1"
            />
            <Input
              type="text"
              value={buttonBlock.textColor}
              onChange={(e) => onChange({ ...buttonBlock, textColor: e.target.value })}
              className="flex-1"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="button-align">配置</Label>
          <Select
            value={buttonBlock.align}
            onValueChange={(value) => onChange({ ...buttonBlock, align: value as "left" | "center" | "right" })}
          >
            <SelectTrigger id="button-align">
              <SelectValue placeholder="配置を選択" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="left">左揃え</SelectItem>
              <SelectItem value="center">中央揃え</SelectItem>
              <SelectItem value="right">右揃え</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2 pt-8">
          <input
            type="checkbox"
            id="button-full-width"
            checked={buttonBlock.fullWidth}
            onChange={(e) => onChange({ ...buttonBlock, fullWidth: e.target.checked })}
            className="h-4 w-4"
          />
          <Label htmlFor="button-full-width">全幅表示</Label>
        </div>
      </div>
    </div>
  )
}

// 区切り線ブロックエディタ
export function DividerBlockEditor({ block, onChange }: BlockEditorProps) {
  const dividerBlock = block as DividerBlock

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="divider-color">線の色</Label>
        <div className="flex items-center gap-2">
          <Input
            id="divider-color"
            type="color"
            value={dividerBlock.color}
            onChange={(e) => onChange({ ...dividerBlock, color: e.target.value })}
            className="w-12 h-8 p-1"
          />
          <Input
            type="text"
            value={dividerBlock.color}
            onChange={(e) => onChange({ ...dividerBlock, color: e.target.value })}
            className="flex-1"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="divider-style">線のスタイル</Label>
        <Select
          value={dividerBlock.style}
          onValueChange={(value) => onChange({ ...dividerBlock, style: value as "solid" | "dashed" | "dotted" })}
        >
          <SelectTrigger id="divider-style">
            <SelectValue placeholder="スタイルを選択" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="solid">実線</SelectItem>
            <SelectItem value="dashed">破線</SelectItem>
            <SelectItem value="dotted">点線</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

// スペーサーブロックエディタ
export function SpacerBlockEditor({ block, onChange }: BlockEditorProps) {
  const spacerBlock = block as SpacerBlock

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="spacer-height">高さ (ピクセル)</Label>
        <Input
          id="spacer-height"
          type="number"
          min="1"
          max="100"
          value={spacerBlock.height}
          onChange={(e) => onChange({ ...spacerBlock, height: Number.parseInt(e.target.value) })}
        />
      </div>
    </div>
  )
}

// ブロックのプレビュー表示
export function BlockPreview({ block }: { block: EmailBlock }) {
  switch (block.type) {
    case "header":
      return <HeaderBlockPreview block={block as HeaderBlock} />
    case "text":
      return <TextBlockPreview block={block as TextBlock} />
    case "image":
      return <ImageBlockPreview block={block as ImageBlock} />
    case "button":
      return <ButtonBlockPreview block={block as ButtonBlock} />
    case "divider":
      return <DividerBlockPreview block={block as DividerBlock} />
    case "spacer":
      return <SpacerBlockPreview block={block as SpacerBlock} />
    case "columns":
      return <ColumnsBlockPreview block={block as ColumnsBlock} />
    default:
      return <div>Unknown block type</div>
  }
}

// 各ブロックタイプのプレビュー
function HeaderBlockPreview({ block }: { block: HeaderBlock }) {
  const style = {
    color: block.color,
    textAlign: block.align as any,
  }

  switch (block.level) {
    case 1:
      return <h1 style={{ ...style, fontSize: "24px", fontWeight: "bold", margin: "10px 0" }}>{block.content}</h1>
    case 2:
      return <h2 style={{ ...style, fontSize: "20px", fontWeight: "bold", margin: "8px 0" }}>{block.content}</h2>
    case 3:
      return <h3 style={{ ...style, fontSize: "16px", fontWeight: "bold", margin: "6px 0" }}>{block.content}</h3>
    default:
      return <h2 style={{ ...style, fontSize: "20px", fontWeight: "bold", margin: "8px 0" }}>{block.content}</h2>
  }
}

function TextBlockPreview({ block }: { block: TextBlock }) {
  return (
    <p
      style={{
        color: block.color,
        textAlign: block.align as any,
        margin: "10px 0",
        lineHeight: "1.5",
      }}
    >
      {block.content}
    </p>
  )
}

function ImageBlockPreview({ block }: { block: ImageBlock }) {
  const containerStyle = {
    textAlign: block.align as any,
    margin: "10px 0",
  }

  const imgStyle = {
    maxWidth: block.width,
    height: "auto",
  }

  const img = <img src={block.src || "/placeholder.svg"} alt={block.alt} style={imgStyle} />

  return (
    <div style={containerStyle}>
      {block.link ? (
        <a href={block.link} target="_blank" rel="noopener noreferrer">
          {img}
        </a>
      ) : (
        img
      )}
    </div>
  )
}

function ButtonBlockPreview({ block }: { block: ButtonBlock }) {
  const containerStyle = {
    textAlign: block.align as any,
    margin: "15px 0",
  }

  const buttonStyle = {
    backgroundColor: block.backgroundColor,
    color: block.textColor,
    padding: "10px 20px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontWeight: "bold",
    display: block.fullWidth ? "block" : "inline-block",
    width: block.fullWidth ? "100%" : "auto",
    textDecoration: "none",
    textAlign: "center" as any,
  }

  return (
    <div style={containerStyle}>
      <a href={block.link} target="_blank" rel="noopener noreferrer" style={buttonStyle}>
        {block.text}
      </a>
    </div>
  )
}

function DividerBlockPreview({ block }: { block: DividerBlock }) {
  return (
    <hr
      style={{
        borderTop: `1px ${block.style} ${block.color}`,
        margin: "15px 0",
        width: "100%",
      }}
    />
  )
}

function SpacerBlockPreview({ block }: { block: SpacerBlock }) {
  return <div style={{ height: `${block.height}px` }}></div>
}

function ColumnsBlockPreview({ block }: { block: ColumnsBlock }) {
  return (
    <div style={{ display: "flex", gap: "20px", margin: "15px 0" }}>
      {block.blocks.map((columnBlocks, index) => (
        <div key={index} style={{ flex: 1 }}>
          {columnBlocks.map((innerBlock) => (
            <BlockPreview key={innerBlock.id} block={innerBlock} />
          ))}
        </div>
      ))}
    </div>
  )
}

// ブロックエディタのメインコンポーネント
export function BlockEditor({
  block,
  onChange,
  onDelete,
}: {
  block: EmailBlock
  onChange: (updatedBlock: EmailBlock) => void
  onDelete: () => void
}) {
  const [isEditing, setIsEditing] = useState(false)

  const renderEditor = () => {
    switch (block.type) {
      case "header":
        return <HeaderBlockEditor block={block} onChange={onChange} />
      case "text":
        return <TextBlockEditor block={block} onChange={onChange} />
      case "image":
        return <ImageBlockEditor block={block} onChange={onChange} />
      case "button":
        return <ButtonBlockEditor block={block} onChange={onChange} />
      case "divider":
        return <DividerBlockEditor block={block} onChange={onChange} />
      case "spacer":
        return <SpacerBlockEditor block={block} onChange={onChange} />
      default:
        return <div>Unknown block type</div>
    }
  }

  return (
    <div className="border rounded-md mb-4 group">
      <div className="flex items-center justify-between bg-muted p-2 rounded-t-md">
        <div className="flex items-center gap-2">
          <Move className="h-4 w-4 text-muted-foreground cursor-move" />
          <span className="text-sm font-medium">{block.type.charAt(0).toUpperCase() + block.type.slice(1)}</span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsEditing(!isEditing)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="p-4">
        {isEditing ? (
          <div className="space-y-4">
            {renderEditor()}
            <div className="flex justify-end">
              <Button size="sm" onClick={() => setIsEditing(false)}>
                完了
              </Button>
            </div>
          </div>
        ) : (
          <div className="min-h-[50px]">
            <BlockPreview block={block} />
          </div>
        )}
      </div>
    </div>
  )
}

// 新しいブロックを追加するためのコンポーネント
export function AddBlockButton({ onAdd }: { onAdd: (type: BlockType) => void }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          ブロックを追加
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56">
        <div className="grid gap-2">
          <Button variant="ghost" className="justify-start" onClick={() => onAdd("header")}>
            <Type className="mr-2 h-4 w-4" />
            見出し
          </Button>
          <Button variant="ghost" className="justify-start" onClick={() => onAdd("text")}>
            <AlignLeft className="mr-2 h-4 w-4" />
            テキスト
          </Button>
          <Button variant="ghost" className="justify-start" onClick={() => onAdd("image")}>
            <Image className="mr-2 h-4 w-4" />
            画像
          </Button>
          <Button variant="ghost" className="justify-start" onClick={() => onAdd("button")}>
            <Link className="mr-2 h-4 w-4" />
            ボタン
          </Button>
          <Button variant="ghost" className="justify-start" onClick={() => onAdd("divider")}>
            <Columns className="mr-2 h-4 w-4" />
            区切り線
          </Button>
          <Button variant="ghost" className="justify-start" onClick={() => onAdd("spacer")}>
            <Grid className="mr-2 h-4 w-4" />
            スペーサー
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

