import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import os

sns.set_palette("husl")


def generate_piecewise_plots():
    # Create directory if it doesn't exist
    
    os.makedirs('../assets/images/blog/piecewise', exist_ok=True)

    # Plot 1: Basic Piecewise Function (Heaviside)
    x = np.linspace(-5, 5, 1000)
    y = np.heaviside(x, 1)

    plt.figure(figsize=(10, 6))
    plt.plot(x, y, 'b-', linewidth=2, label='Heaviside Function')
    plt.grid(True, alpha=0.3)
    plt.title('Discontinuous Piecewise Function: Heaviside', fontsize=14)
    plt.xlabel('x', fontsize=12)
    plt.ylabel('H(x)', fontsize=12)
    plt.legend()
    plt.savefig('../assets/images/blog/piecewise/heaviside.png', dpi=300, bbox_inches='tight')
    plt.close()

    # Plot 2: ReLU and Variants
    plt.figure(figsize=(10, 6))
    plt.plot(x, np.maximum(0, x), 'b-', label='ReLU')
    plt.plot(x, np.where(x > 0, x, 0.1 * x), 'r-', label='Leaky ReLU')
    plt.plot(x, np.where(x > 0, x, np.exp(x) - 1), 'g-', label='ELU')
    plt.grid(True, alpha=0.3)
    plt.title('Common Neural Network Activation Functions', fontsize=14)
    plt.xlabel('x', fontsize=12)
    plt.ylabel('f(x)', fontsize=12)
    plt.legend()
    plt.savefig('../assets/images/blog/piecewise/activations.png', dpi=300, bbox_inches='tight')
    plt.close()

    # Plot 3: Universal Approximation Example
    def target_function(x):
        return np.sin(x) * np.exp(-0.1 * x)

    def relu_network(x, weights, biases):
        return sum(w * np.maximum(0, x + b) for w, b in zip(weights, biases))

    # Simple approximation with 10 ReLU units
    weights = np.random.randn(10)
    biases = np.random.randn(10)

    plt.figure(figsize=(10, 6))
    plt.plot(x, target_function(x), label='Target Function')
    plt.plot(x, relu_network(x, weights, biases), label='ReLU Network Approximation')
    plt.title('Universal Approximation with ReLU Network')
    plt.grid(True, alpha=0.3)
    plt.legend()
    plt.xlabel('x')
    plt.ylabel('f(x)')
    plt.savefig('../assets/images/blog/piecewise/approximation.png', dpi=300, bbox_inches='tight')
    plt.close()

    # Plot 3: Spline Example
    from scipy.interpolate import CubicSpline
    x_points = np.array([-4, -2, 0, 2, 4])
    y_points = np.array([-2, 1, 0, 1, -1])
    cs = CubicSpline(x_points, y_points)
    x_smooth = np.linspace(-4, 4, 1000)

    plt.figure(figsize=(10, 6))
    plt.plot(x_smooth, cs(x_smooth), 'b-', label='Cubic Spline')
    plt.plot(x_points, y_points, 'ro', label='Control Points')
    plt.grid(True, alpha=0.3)
    plt.title('Smooth Piecewise Function: Cubic Spline', fontsize=14)
    plt.xlabel('x', fontsize=12)
    plt.ylabel('f(x)', fontsize=12)
    plt.legend()
    plt.savefig('../assets/images/blog/piecewise/spline.png', dpi=300, bbox_inches='tight')
    plt.close()



if __name__ == "__main__":
    generate_piecewise_plots()
