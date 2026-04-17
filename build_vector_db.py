import pandas as pd
from langchain_community.document_loaders import DataFrameLoader
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
import os

def create_vector_db():
    print("Loading medical data...")
    # 1. Load your dataset
    try:
        data = pd.read_csv('medical data.csv')
    except FileNotFoundError:
        print("Error: medical data.csv not found. Please ensure it is in the directory.")
        return

    # Clean the data (similar to your old script)
    data.drop(['Name', 'DateOfBirth', 'Gender'], axis=1, inplace=True, errors='ignore')
    for column in ['Symptoms', 'Causes', 'Disease', 'Medicine']:
        if column in data.columns:
            data[column] = data[column].fillna("Unknown")

    # 2. Combine columns into a single rich text block for the LLM to read
    # We create a new column called 'page_content' which LangChain expects
    data['page_content'] = data.apply(
        lambda row: f"Disease: {row.get('Disease', 'Unknown')}. "
                    f"Symptoms include: {row.get('Symptoms', 'Unknown')}. "
                    f"Common causes: {row.get('Causes', 'Unknown')}. "
                    f"Recommended medicine/treatment: {row.get('Medicine', 'Unknown')}.", 
        axis=1
    )

    # 3. Load the dataframe into LangChain Document objects
    loader = DataFrameLoader(data, page_content_column="page_content")
    documents = loader.load()
    print(f"Loaded {len(documents)} medical records.")

    # 4. Initialize the Embedding Model (Open source, runs locally)
    # 'all-MiniLM-L6-v2' is small, fast, and great for standard text
    print("Initializing embedding model (this may take a moment to download the first time)...")
    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

    # 5. Create and persist the Chroma Vector Database
    # This will create a folder called 'chroma_db' in your project directory
    persist_directory = "./chroma_db"
    
    print("Generating embeddings and building Vector DB...")
    vector_db = Chroma.from_documents(
        documents=documents,
        embedding=embeddings,
        persist_directory=persist_directory
    )
    
    print(f"Success! Vector database saved locally in {persist_directory}")

if __name__ == "__main__":
    create_vector_db()