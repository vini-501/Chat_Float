from supabase import create_client, Client

# Replace with your Supabase project details
url: str = "https://dmlgzmzhjfwnvmyegmia.supabase.co"
key: str = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtbGd6bXpoamZ3bnZteWVnbWlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1MDU2NDAsImV4cCI6MjA3MzA4MTY0MH0.fBdL0jqhulMEp-7NqEmAsDXdPvjLYLaIPlyzYlYS48I"

# Initialize the Supabase client
supabase: Client = create_client(url, key)

def test_columns():
    # Test basic columns first
    try:
        response = supabase.table("argo_profiles").select("file, juld, DATE, LATITUDE, LONGITUDE").limit(1).execute()
        print("✅ Basic columns work:", list(response.data[0].keys()) if response.data else "No data")
    except Exception as e:
        print("❌ Basic columns failed:", str(e))
    
    # Test temperature columns
    try:
        response = supabase.table("argo_profiles").select("shallow_TEMP_mean").limit(1).execute()
        print("✅ shallow_TEMP_mean works")
    except Exception as e:
        print("❌ shallow_TEMP_mean failed:", str(e))
        
        # Try alternative name
        try:
            response = supabase.table("argo_profiles").select("shallow_temp_mean").limit(1).execute()
            print("✅ shallow_temp_mean (lowercase) works")
        except Exception as e2:
            print("❌ shallow_temp_mean (lowercase) also failed:", str(e2))
    
    # Test QC columns
    try:
        response = supabase.table("argo_profiles").select("PROFILE_TEMP_QC").limit(1).execute()
        print("✅ PROFILE_TEMP_QC works")
    except Exception as e:
        print("❌ PROFILE_TEMP_QC failed:", str(e))
        
        # Try alternative name
        try:
            response = supabase.table("argo_profiles").select("profile_temp_qc").limit(1).execute()
            print("✅ profile_temp_qc (lowercase) works")
        except Exception as e2:
            print("❌ profile_temp_qc (lowercase) also failed:", str(e2))

    # Get all column names from first row
    try:
        response = supabase.table("argo_profiles").select("*").limit(1).execute()
        if response.data:
            print("\n📋 All available columns:")
            for i, col in enumerate(response.data[0].keys(), 1):
                print(f"  {i:2d}. {col}")
        else:
            print("❌ No data found")
    except Exception as e:
        print("❌ Failed to get all columns:", str(e))

if __name__ == "__main__":
    test_columns()
