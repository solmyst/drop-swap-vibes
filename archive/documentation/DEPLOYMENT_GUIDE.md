# 🚀 Deployment Guide - revastra.me

## GitHub Pages Deployment with Custom Domain

### Prerequisites Completed ✅
- ✅ GitHub Actions workflow created (`.github/workflows/deploy.yml`)
- ✅ Vite config updated for custom domain
- ✅ CNAME file set to `revastra.me`

---

## Step 1: Configure GitHub Repository Settings

### 1.1 Enable GitHub Pages
1. Go to your GitHub repository: `https://github.com/solmyst/drop-swap-vibes`
2. Click **Settings** → **Pages**
3. Under **Source**, select:
   - Source: **GitHub Actions**
4. Click **Save**

### 1.2 Add Environment Secrets
Go to **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

Add these secrets (get values from your `.env` file):

```
VITE_SUPABASE_PROJECT_ID = "your-project-id"
VITE_SUPABASE_PUBLISHABLE_KEY = "your-anon-key"
VITE_SUPABASE_URL = "https://your-project.supabase.co"
VITE_UPI_ID = "8619742031@pthdfc"
```

---

## Step 2: Configure Custom Domain (revastra.me)

### 2.1 DNS Settings (Your Domain Registrar)
Go to your domain registrar (where you bought revastra.me) and add these DNS records:

#### For Apex Domain (revastra.me):
```
Type: A
Name: @
Value: 185.199.108.153

Type: A
Name: @
Value: 185.199.109.153

Type: A
Name: @
Value: 185.199.110.153

Type: A
Name: @
Value: 185.199.111.153
```

#### For WWW Subdomain (optional):
```
Type: CNAME
Name: www
Value: solmyst.github.io
```

### 2.2 Configure Custom Domain in GitHub
1. Go to **Settings** → **Pages**
2. Under **Custom domain**, enter: `revastra.me`
3. Click **Save**
4. Wait for DNS check (may take a few minutes)
5. Once verified, check **Enforce HTTPS**

---

## Step 3: Deploy

### Option A: Automatic Deployment (Recommended)
Just push to main branch:
```bash
git add -A
git commit -m "Configure GitHub Pages deployment"
git push origin main
```

The GitHub Action will automatically:
- Build your app
- Deploy to GitHub Pages
- Make it live at `https://revastra.me`

### Option B: Manual Deployment
```bash
# Build the project
npm run build

# The dist folder is ready for deployment
```

---

## Step 4: Verify Deployment

### Check Deployment Status
1. Go to **Actions** tab in GitHub
2. Watch the "Deploy to GitHub Pages" workflow
3. Wait for green checkmark ✅

### Test Your Site
1. Visit: `https://revastra.me`
2. Test all features:
   - ✅ Homepage loads
   - ✅ Auth works
   - ✅ Browse products
   - ✅ Upload works
   - ✅ Profile page
   - ✅ Supabase connection

---

## Troubleshooting

### Issue: 404 Page Not Found
**Solution**: Make sure `public/404.html` exists and contains proper redirect logic.

### Issue: Blank Page
**Solution**: 
1. Check browser console for errors
2. Verify environment variables are set in GitHub Secrets
3. Check if Supabase URL is correct

### Issue: DNS Not Resolving
**Solution**:
1. Wait 24-48 hours for DNS propagation
2. Use `nslookup revastra.me` to check DNS
3. Clear browser cache

### Issue: HTTPS Not Working
**Solution**:
1. Wait for GitHub to provision SSL certificate (can take up to 24 hours)
2. Make sure "Enforce HTTPS" is checked in Settings → Pages

---

## Post-Deployment Checklist

After successful deployment:

- [ ] Test login/signup
- [ ] Test product upload
- [ ] Test messaging
- [ ] Test on mobile devices
- [ ] Check all images load
- [ ] Verify Supabase connection
- [ ] Test payment flow (if applicable)
- [ ] Check SEO meta tags
- [ ] Test social sharing
- [ ] Monitor error logs

---

## Updating Your Site

Every time you push to `main` branch, GitHub Actions will automatically rebuild and redeploy your site.

```bash
# Make changes
git add -A
git commit -m "Your changes"
git push origin main

# Wait 2-3 minutes for deployment
# Visit https://revastra.me to see changes
```

---

## Important Notes

### Environment Variables
- Never commit `.env` file to git
- Always use GitHub Secrets for sensitive data
- Update secrets if you rotate Supabase keys

### Domain Configuration
- DNS changes can take 24-48 hours to propagate globally
- Use `https://` not `http://` after HTTPS is enabled
- WWW redirect is automatic if configured

### Performance
- GitHub Pages uses CDN for fast global delivery
- Your site will be cached
- First load might be slow, subsequent loads are fast

---

## Monitoring

### Check Deployment Logs
1. Go to **Actions** tab
2. Click on latest workflow run
3. View logs for any errors

### Analytics (Optional)
Consider adding:
- Google Analytics
- Vercel Analytics
- Plausible Analytics

---

## Support

If you encounter issues:
1. Check GitHub Actions logs
2. Verify DNS settings
3. Check Supabase connection
4. Review browser console errors

---

## Success! 🎉

Once deployed, your रीवस्त्र thrift marketplace will be live at:
- **Primary**: https://revastra.me
- **WWW**: https://www.revastra.me (if configured)

Share your link and start building your community! 🚀
