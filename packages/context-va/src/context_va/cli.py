import typer
from pathlib import Path
from .renderer import render_visual_abstract

va_cmd = typer.Typer()

@va_cmd.callback(invoke_without_command=True)
def main(
    input: str = typer.Option(..., "--input", "-i", help="Input file (mocked for demo)"),
    style: str = typer.Option("jama", "--style", help="Style config"),
):
    typer.echo(f"Running visual abstract generator on {input} with style {style}")
    output_path = Path("visual_abstract.png")
    
    # Mock data
    data = {
        "title": "Effect of Mock Intervention on Demo Outcomes",
        "pico": {
            "population": "1000 Simulated Patients",
            "intervention": "Context-Med Pipeline",
            "comparison": "Manual Workflow",
            "outcome": "90% Reduction in Publication Time"
        },
        "stats": "p < 0.001"
    }
    
    render_visual_abstract(data, str(output_path))
    typer.echo(f"Success! Visual abstract saved to {output_path.absolute()}")
