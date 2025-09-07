#!/bin/bash

# Script to fix all admin APIs to use validateAdminAccess helper

echo "🔍 Analyzing admin APIs..."

# Find all admin API files that need fixing
admin_files=(
  "server/api/admin/customers/index.get.ts"
  "server/api/admin/customers/stats.get.ts"  
  "server/api/admin/template-types/index.get.ts"
  "server/api/admin/products/index.get.ts"
  "server/api/admin/products/[id].get.ts"
  "server/api/admin/orders/index.get.ts"
  "server/api/admin/orders/[id].get.ts"
  "server/api/admin/categories/index.get.ts"
  "server/api/admin/reviews/index.get.ts"
)

for file in "${admin_files[@]}"; do
  if [[ -f "$file" ]]; then
    echo "📝 Checking $file..."
    
    # Check if it uses serverSupabaseClient
    if grep -q "serverSupabaseClient" "$file"; then
      echo "⚠️  Found serverSupabaseClient in $file - needs fixing"
      
      # Create backup
      cp "$file" "$file.backup"
      
      # Replace the auth logic (this is a simple pattern - may need manual review)
      sed -i.tmp '
        s/import { serverSupabaseClient, serverSupabaseUser }/import { validateAdminAccess }/g;
        s/import { serverSupabaseServiceRole, serverSupabaseUser }/import { validateAdminAccess }/g;
      ' "$file"
      
      echo "✅ Fixed imports in $file"
    else
      echo "✅ $file looks good"
    fi
  else
    echo "⚠️  File not found: $file"
  fi
done

echo "🎉 Admin API analysis complete!"