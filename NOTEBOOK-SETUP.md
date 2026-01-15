# Jupyter Notebook Setup

This guide will help you set up a clean Python environment for the Wiktionary analysis notebook.

## Quick Setup (Recommended)

Run the setup script:

```bash
./setup-notebook.sh
```

This will:
1. Create a virtual environment at `venv-notebook/`
2. Install Jupyter, pandas, and ipykernel
3. Register the kernel with Jupyter

## Manual Setup

If you prefer to set up manually:

### 1. Create and activate virtual environment

```bash
# Create virtual environment
python3 -m venv venv-notebook

# Activate it (macOS/Linux)
source venv-notebook/bin/activate

# Activate it (Windows)
# venv-notebook\Scripts\activate
```

### 2. Install packages

```bash
pip install --upgrade pip
pip install -r requirements-notebook.txt
```

### 3. Install Jupyter kernel

```bash
python -m ipykernel install --user --name=wiktionary-analysis --display-name="Wiktionary Analysis"
```

## Using the Notebook

### Start Jupyter

From the project root:

```bash
jupyter notebook wiktionary-analysis.ipynb
```

This will open your browser with the notebook.

### Select the Kernel

In the Jupyter interface:
1. Click **Kernel** → **Change kernel**
2. Select **"Wiktionary Analysis"**
3. Run the cells!

## Installed Packages

- `jupyter` - Jupyter notebook interface
- `pandas` - Data analysis and SQL result display
- `ipykernel` - Jupyter kernel support

## Troubleshooting

### "Kernel not found"

If the kernel doesn't appear:

```bash
# List installed kernels
jupyter kernelspec list

# If not listed, reinstall:
source venv-notebook/bin/activate
python -m ipykernel install --user --name=wiktionary-analysis --display-name="Wiktionary Analysis"
```

### "Module not found"

Make sure you activated the virtual environment and selected the correct kernel in Jupyter.

### Clean reinstall

```bash
# Remove virtual environment
rm -rf venv-notebook/

# Remove kernel
jupyter kernelspec uninstall wiktionary-analysis

# Run setup again
./setup-notebook.sh
```

## Deactivating

When you're done:

```bash
deactivate
```
