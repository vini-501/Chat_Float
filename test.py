from supabase import create_client, Client

# Replace with your Supabase project details
url: str = "https://dmlgzmzhjfwnvmyegmia.supabase.co"
key: str = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtbGd6bXpoamZ3bnZteWVnbWlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1MDU2NDAsImV4cCI6MjA3MzA4MTY0MH0.fBdL0jqhulMEp-7NqEmAsDXdPvjLYLaIPlyzYlYS48I"

# Initialize the Supabase client
supabase: Client = create_client(url, key)

# Replace 'your_table' with the actual table name
def get_first_rows():
    response = supabase.table("argo_profiles").select("*").limit(5).execute()
    return response.data

if __name__ == "__main__":
    rows = get_first_rows()
    for i, row in enumerate(rows, start=1):
        print(f"Row {i}: {row}")
