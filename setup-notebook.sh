#!/bin/bash

# Setup script for Jupyter notebook environment

echo "Setting up Jupyter notebook environment..."

# Create virtual environment
python3 -m venv venv-notebook

# Activate virtual environment
source venv-notebook/bin/activate

# Upgrade pip
pip install --upgrade pip

# Install requirements
pip install -r requirements-notebook.txt

# Install the kernel
python -m ipykernel install --user --name=wiktionary-analysis --display-name="Wiktionary Analysis"

echo ""
echo "✅ Setup complete!"
echo ""
echo "To use the notebook:"
echo "1. Start Jupyter: jupyter notebook wiktionary-analysis.ipynb"
echo "2. In the notebook, select Kernel → Change kernel → 'Wiktionary Analysis'"
echo ""
echo "The virtual environment is at: venv-notebook/"
echo "To activate it manually: source venv-notebook/bin/activate"
