"use client"

import { useState } from "react"
import { ArinSuggestChat } from "@/components/arin-suggest-chat"

const SuggestPage = () => {
  const [isConversationalMode, setIsConversationalMode] = useState(true)

  return (
    <div>
      <ArinSuggestChat
        isOpen={true}
        onClose={() => {}}
        onDecision={() => {}}
        items={[]}
        baseItem={null}
        startWithPresentation={true}
      />
    </div>
  )
}

export default SuggestPage
