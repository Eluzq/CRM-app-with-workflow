import fetch from "node-fetch"

const TRELLO_API_KEY = process.env.TRELLO_API_KEY || ""
const TRELLO_TOKEN = process.env.TRELLO_TOKEN || ""
const TRELLO_BOARD_ID = process.env.TRELLO_BOARD_ID || ""
const TRELLO_API_URL = "https://api.trello.com/1"

export interface TrelloCard {
  id: string
  name: string
  desc: string
  idList: string
  due?: string
  labels?: { id: string; name: string; color: string }[]
}

export interface TrelloList {
  id: string
  name: string
}

export const trelloService = {
  async getLists(): Promise<TrelloList[]> {
    try {
      if (!TRELLO_API_KEY || !TRELLO_TOKEN || !TRELLO_BOARD_ID) {
        throw new Error("Trello API credentials are missing")
      }

      const response = await fetch(
        `${TRELLO_API_URL}/boards/${TRELLO_BOARD_ID}/lists?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`,
      )

      if (!response.ok) {
        throw new Error(`Trello API error: ${response.status}`)
      }

      // 型アサーションを使用して、APIレスポンスをTrelloList[]として扱う
      return (await response.json()) as TrelloList[]
    } catch (error) {
      console.error("Error fetching Trello lists:", error)
      // 安全にエラーメッセージを抽出
      const errorMessage =
        error && typeof error === "object" && "message" in error ? String(error.message) : "Unknown error occurred"
      throw new Error(errorMessage)
    }
  },

  async getCards(listId: string): Promise<TrelloCard[]> {
    try {
      if (!TRELLO_API_KEY || !TRELLO_TOKEN) {
        throw new Error("Trello API credentials are missing")
      }

      const response = await fetch(
        `${TRELLO_API_URL}/lists/${listId}/cards?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`,
      )

      if (!response.ok) {
        throw new Error(`Trello API error: ${response.status}`)
      }

      // 型アサーションを使用して、APIレスポンスをTrelloCard[]として扱う
      return (await response.json()) as TrelloCard[]
    } catch (error) {
      console.error("Error fetching Trello cards:", error)
      // 安全にエラーメッセージを抽出
      const errorMessage =
        error && typeof error === "object" && "message" in error ? String(error.message) : "Unknown error occurred"
      throw new Error(errorMessage)
    }
  },

  async createCard(listId: string, card: { name: string; desc: string; due?: string }): Promise<TrelloCard> {
    try {
      if (!TRELLO_API_KEY || !TRELLO_TOKEN) {
        throw new Error("Trello API credentials are missing")
      }

      const params = new URLSearchParams({
        key: TRELLO_API_KEY,
        token: TRELLO_TOKEN,
        idList: listId,
        name: card.name,
        desc: card.desc,
        ...(card.due && { due: card.due }),
      })

      const response = await fetch(`${TRELLO_API_URL}/cards`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params,
      })

      if (!response.ok) {
        throw new Error(`Trello API error: ${response.status}`)
      }

      // 型アサーションを使用して、APIレスポンスをTrelloCardとして扱う
      return (await response.json()) as TrelloCard
    } catch (error) {
      console.error("Error creating Trello card:", error)
      // 安全にエラーメッセージを抽出
      const errorMessage =
        error && typeof error === "object" && "message" in error ? String(error.message) : "Unknown error occurred"
      throw new Error(errorMessage)
    }
  },

  async updateCard(
    cardId: string,
    updates: { name?: string; desc?: string; idList?: string; due?: string },
  ): Promise<TrelloCard> {
    try {
      if (!TRELLO_API_KEY || !TRELLO_TOKEN) {
        throw new Error("Trello API credentials are missing")
      }

      const params = new URLSearchParams({
        key: TRELLO_API_KEY,
        token: TRELLO_TOKEN,
        ...updates,
      })

      const response = await fetch(`${TRELLO_API_URL}/cards/${cardId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params,
      })

      if (!response.ok) {
        throw new Error(`Trello API error: ${response.status}`)
      }

      // 型アサーションを使用して、APIレスポンスをTrelloCardとして扱う
      return (await response.json()) as TrelloCard
    } catch (error) {
      console.error("Error updating Trello card:", error)
      // 安全にエラーメッセージを抽出
      const errorMessage =
        error && typeof error === "object" && "message" in error ? String(error.message) : "Unknown error occurred"
      throw new Error(errorMessage)
    }
  },

  async deleteCard(cardId: string): Promise<void> {
    try {
      if (!TRELLO_API_KEY || !TRELLO_TOKEN) {
        throw new Error("Trello API credentials are missing")
      }

      const response = await fetch(`${TRELLO_API_URL}/cards/${cardId}?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error(`Trello API error: ${response.status}`)
      }
    } catch (error) {
      console.error("Error deleting Trello card:", error)
      // 安全にエラーメッセージを抽出
      const errorMessage =
        error && typeof error === "object" && "message" in error ? String(error.message) : "Unknown error occurred"
      throw new Error(errorMessage)
    }
  },

  // Trelloのタスクをローカルのタスク形式に変換するユーティリティ
  mapTrelloCardToTask(card: TrelloCard, listName: string) {
    // ラベルから優先度を取得
    let priority = "中"
    if (card.labels && card.labels.length > 0) {
      const priorityLabel = card.labels.find((label) => ["高", "中", "低"].includes(label.name))
      if (priorityLabel) {
        priority = priorityLabel.name
      }
    }

    // ラベルから担当者を取得
    let assignee = ""
    if (card.labels && card.labels.length > 0) {
      const assigneeLabel = card.labels.find((label) => !["高", "中", "低"].includes(label.name))
      if (assigneeLabel) {
        assignee = assigneeLabel.name
      }
    }

    return {
      id: card.id,
      title: card.name,
      description: card.desc,
      dueDate: card.due ? new Date(card.due).toISOString().split("T")[0] : "",
      assignee,
      priority,
      status: mapTrelloListToStatus(listName),
      trelloCardId: card.id,
    }
  },
}

// Trelloのリスト名をローカルのステータスに変換
function mapTrelloListToStatus(listName: string): string {
  const mapping: Record<string, string> = {
    計画中: "planning",
    進行中: "inProgress",
    レビュー中: "review",
    完了: "completed",
  }

  return mapping[listName] || "planning"
}

// ローカルのステータスをTrelloのリスト名に変換
export function mapStatusToTrelloList(status: string): string {
  const mapping: Record<string, string> = {
    planning: "計画中",
    inProgress: "進行中",
    review: "レビュー中",
    completed: "完了",
  }

  return mapping[status] || "計画中"
}

