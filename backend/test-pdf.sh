#!/bin/bash
# Test PDF generation in Docker environment

set -e

echo "=== PDF Generator Test Script ==="
echo ""

# Build the pandoc image
echo "Building Pandoc Docker image..."
docker build -t dashboard-pandoc:latest ./pandoc

# Test pandoc version
echo ""
echo "Testing Pandoc installation..."
docker run --rm dashboard-pandoc:latest pandoc --version | head -3

# Test PDF generation with each template
echo ""
echo "=== Testing PDF Generation ==="

mkdir -p ./test-output

for template in minimal academic modern; do
    echo ""
    echo "Testing template: $template"
    
    output_file="./test-output/test-${template}.pdf"
    
    docker run --rm \
        -v "$(pwd)/__tests__:/data:ro" \
        -v "$(pwd)/templates:/templates:ro" \
        -v "$(pwd)/test-output:/output" \
        dashboard-pandoc:latest \
        pandoc /data/test-markdown.md \
            -o "/output/test-${template}.pdf" \
            --template=/templates/latex/${template}/template.tex \
            --pdf-engine=pdflatex \
            --from=markdown+yaml_metadata_block+tex_math_dollars \
            --listings \
            --toc \
            -V papersize=a4 \
            -V margin=2.5cm
    
    file_size=$(stat -f%z "$output_file" 2>/dev/null || stat -c%s "$output_file" 2>/dev/null || echo "unknown")
    echo "  Generated: $output_file (${file_size} bytes)"
done

echo ""
echo "=== Test Complete ==="
echo ""
echo "Generated PDFs:"
ls -lh ./test-output/
