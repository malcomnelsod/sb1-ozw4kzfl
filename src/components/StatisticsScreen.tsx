import React, { useEffect, useRef } from 'react';
import { Statistics } from '../types';
import { formatDuration } from '../utils/timeUtils';
import { BarChart, ArrowLeft } from 'lucide-react';

interface StatisticsScreenProps {
  statistics: Statistics;
  onBack: () => void;
}

const StatisticsScreen: React.FC<StatisticsScreenProps> = ({ statistics, onBack }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (chartRef.current && statistics.history.length > 0) {
      renderChart();
    }
  }, [statistics]);

  const renderChart = () => {
    if (!chartRef.current) return;

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    // Simple canvas-based chart rendering
    const { width, height } = chartRef.current;
    ctx.clearRect(0, 0, width, height);

    // Only show latest 10 results
    const data = [...statistics.history]
      .slice(-10)
      .map(h => h.score);

    const maxScore = 100;
    const barWidth = width / (data.length + 1);
    const padding = 40;

    // Draw x and y axes
    ctx.beginPath();
    ctx.moveTo(padding, 10);
    ctx.lineTo(padding, height - padding);
    ctx.lineTo(width - 10, height - padding);
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw y-axis labels
    ctx.fillStyle = '#64748B';
    ctx.font = '12px sans-serif';
    [0, 25, 50, 75, 100].forEach(mark => {
      const y = height - padding - (mark / maxScore) * (height - padding - 10);
      ctx.fillText(mark.toString(), padding - 25, y + 4);
      
      // Draw horizontal grid lines
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - 10, y);
      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // Draw bars
    data.forEach((score, index) => {
      const x = padding + (index + 0.5) * barWidth;
      const barHeight = (score / maxScore) * (height - padding - 10);
      const y = height - padding - barHeight;
      
      // Gradient fill
      const gradient = ctx.createLinearGradient(x, y, x, height - padding);
      gradient.addColorStop(0, '#3B82F6');  // Blue at top
      gradient.addColorStop(1, '#93C5FD');  // Lighter blue at bottom
      
      ctx.fillStyle = gradient;
      ctx.fillRect(x - barWidth / 3, y, barWidth / 1.5, barHeight);
      
      // Draw score label on top of the bar
      ctx.fillStyle = '#1E40AF';
      ctx.fillText(Math.round(score).toString(), x - 10, y - 5);
      
      // Draw quiz number at bottom
      ctx.fillStyle = '#64748B';
      ctx.fillText(`#${index + 1}`, x - 10, height - padding + 16);
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-blue-700">Your Statistics</h1>
          <button
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Quiz
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-blue-50 p-6 rounded-lg text-center">
            <div className="text-4xl font-bold text-blue-700 mb-2">
              {statistics.totalQuizzes}
            </div>
            <div className="text-sm text-gray-600">Quizzes Completed</div>
          </div>
          
          <div className="bg-green-50 p-6 rounded-lg text-center">
            <div className="text-4xl font-bold text-green-700 mb-2">
              {statistics.averageScore.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Average Score</div>
          </div>
          
          <div className="bg-purple-50 p-6 rounded-lg text-center">
            <div className="text-4xl font-bold text-purple-700 mb-2">
              {statistics.history.length > 0 
                ? statistics.history[statistics.history.length - 1].score.toFixed(1)
                : 0}%
            </div>
            <div className="text-sm text-gray-600">Last Quiz Score</div>
          </div>
        </div>
        
        {/* Performance Chart */}
        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-700 mb-4 flex items-center">
            <BarChart className="h-5 w-5 mr-2 text-blue-600" />
            Performance History
          </h2>
          
          {statistics.history.length > 0 ? (
            <div className="bg-white border rounded-lg p-4">
              <canvas
                ref={chartRef}
                width={800}
                height={300}
                className="w-full h-64"
              />
            </div>
          ) : (
            <div className="bg-gray-50 border rounded-lg p-8 text-center text-gray-500">
              No quiz history available yet. Complete a quiz to see your performance graph.
            </div>
          )}
        </div>
        
        {/* Quiz History */}
        <h2 className="text-lg font-medium text-gray-700 mb-4">Quiz History</h2>
        
        {statistics.history.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                    Date
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                    Questions
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                    Correct
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                    Score
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                    Time Taken
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {[...statistics.history].reverse().map((quiz) => (
                  <tr key={quiz.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {new Date(quiz.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {quiz.totalQuestions}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {quiz.correctAnswers}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        quiz.score >= 70 
                          ? 'bg-green-100 text-green-800' 
                          : quiz.score >= 50 
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {quiz.score.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {formatDuration(quiz.timeTaken)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-gray-50 border rounded-lg p-8 text-center text-gray-500">
            No quiz history available yet. Complete a quiz to see your history.
          </div>
        )}
      </div>
    </div>
  );
};

export default StatisticsScreen;