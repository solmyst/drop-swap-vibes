# ⚡ Quick Deployment Steps

## 🎯 Deploy to revastra.me in 5 Steps

### Step 1: GitHub Repository Settings (2 minutes)
1. Go to: https://github.com/solmyst/drop-swap-vibes/settings/pages
2. Under **Source**, select: **GitHub Actions**
3. Click **Save**

### Step 2: Add Secrets (3 minutes)
1. Go to: https://github.com/solmyst/drop-swap-vibes/settings/secrets/actions
2. Click **New repository secret** and add these 4 secrets:

```
Name: VITE_SUPABASE_PROJECT_ID
Value: [Get from your .env file]

Name: VITE_SUPABASE_PUBLISHABLE_KEY
Value: [Get from your .env file]

Name: VITE_SUPABASE_URL
Value: [Get from your .env file]

Name: VITE_UPI_ID
Value: 8619742031@pthdfc
```

### Step 3: Configure DNS (5 minutes)
Go to your domain registrar (where you bought revastra.me) and add these A records:

```
Type: A, Name: @, Value: 185.199.108.153
Type: A, Name: @, Value: 185.199.109.153
Type: A, Name: @, Value: 185.199.110.153
Type: A, Name: @, Value: 185.199.111.153
```

### Step 4: Set Custom Domain (1 minute)
1. Go to: https://github.com/solmyst/drop-swap-vibes/settings/pages
2. Under **Custom domain**, enter: `revastra.me`
3. Click **Save**
4. Wait for DNS check ✅
5. Check **Enforce HTTPS**

### Step 5: Deploy! (Automatic)
The deployment will start automatically! Check progress:
- Go to: https://github.com/solmyst/drop-swap-vibes/actions
- Watch the "Deploy to GitHub Pages" workflow
- Wait for green checkmark ✅ (takes 2-3 minutes)

---

## ✅ Done!

Your site will be live at: **https://revastra.me**

**Note**: DNS propagation can take 24-48 hours. If revastra.me doesn't work immediately, try:
- `https://solmyst.github.io/drop-swap-vibes/` (temporary URL)
- Wait a few hours and try again
- Clear browser cache

---

## 🔧 If Something Goes Wrong

### Deployment Failed?
- Check GitHub Actions logs
- Verify all 4 secrets are added correctly
- Make sure Supabase keys are valid

### Domain Not Working?
- Wait 24-48 hours for DNS
- Check DNS with: `nslookup revastra.me`
- Verify A records are correct

### Need Help?
Read the full guide: `DEPLOYMENT_GUIDE.md`
