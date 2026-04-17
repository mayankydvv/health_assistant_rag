import os
from langchain_community.vectorstores import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_classic.chains import create_retrieval_chain
from langchain_classic.chains.combine_documents import create_stuff_documents_chain

# 1. Set your API Key
groq_api_key = os.getenv("GROQ_API_KEY")

def test_rag_pipeline():
    # 2. Re-initialize the embedding model and connect to your existing DB
    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    vector_db = Chroma(persist_directory="./chroma_db", embedding_function=embeddings)
    
    # Create a retriever (fetches the top 3 closest matches)
    retriever = vector_db.as_retriever(search_kwargs={"k": 3})

    # 3. Initialize the LLM (Llama 3 8B is lightning fast and great for basic RAG)
    llm = ChatGroq(model_name="llama-3.1-8b-instant", temperature=0.2)

    # 4. Prompt Engineering: The System Prompt
    system_prompt = (
        "You are a helpful and cautious healthcare assistant. "
        "Use the following pieces of retrieved context to answer the user's symptom query. "
        "Provide a concise summary of the disease, causes, and recommended medicine. "
        "If you don't know the answer or the context is empty, just say that you recommend consulting a doctor. "
        "DO NOT invent any medical advice outside of this context.\n\n"
        "{context}"
    )

    prompt = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        ("human", "{input}"),
    ])

    # 5. Build the LangChain Chains
    # This chain handles passing the retrieved documents to the LLM
    question_answer_chain = create_stuff_documents_chain(llm, prompt)
    # This chain handles taking the user input, retrieving docs, and passing them to the QA chain
    rag_chain = create_retrieval_chain(retriever, question_answer_chain)

    # 6. Test it out!
    print("🤖 Healthcare RAG System Online (Type 'quit' to exit)")
    while True:
        user_input = input("\nDescribe your symptoms: ")
        if user_input.lower() == 'quit':
            break
            
        # Run the RAG chain
        print("Thinking...")
        response = rag_chain.invoke({"input": user_input})
        
        print("\n--- Assistant Response ---")
        print(response["answer"])
        print("\n--- Retrieved Context (For Interview Debugging) ---")
        for doc in response["context"]:
            print(f"- {doc.page_content}")

if __name__ == "__main__":
    test_rag_pipeline()