// ... imports ...
// (No changes to imports)

// ... interfaces ...
// (No changes to interfaces)

const Quiz = () => {
  // ... (no changes to state variables) ...

  // ... (no changes to useEffect loadQuizzes) ...

  // ... (no changes to useEffect loadCompletions) ...

  // ... (no changes to getDifficultyColor) ...

  const handleQuizComplete = async (quizId: number, score: number) => {
    // --- UPDATED: XP Logic ---
    
    // Find quiz meta
    const quizMeta = quizzes.find(q => q.id === quizId);
    const xpToAdd = (quizMeta?.xp_reward || 0);
    
    // Check old score *before* updating state
    const oldScore = quizScores[quizId];
    const alreadyPassed = oldScore !== undefined && oldScore >= 70;

    // Update local state immediately for UI responsiveness
    setQuizScores(prev => ({ ...prev, [quizId]: score }));
    
    const isPass = score >= 70;
    
    // Only award XP if they just passed (isPass=true) AND they had not already passed (alreadyPassed=false)
    const shouldAwardXp = isPass && !alreadyPassed;
    // --- End of UPDATED XP Logic ---

    // Save completion to database (score)
    if (user) {
      try {
        await supabase
          .from('quiz_completions')
          .upsert({
            user_id: user.id,
            quiz_id: quizId,
            score: score,
          }, { onConflict: ['user_id', 'quiz_id'] });

        // --- NEW: Update XP in user_stats table ---
        if (shouldAwardXp && xpToAdd > 0) {
          const { error: rpcError } = await supabase.rpc('increment_user_xp', { 
            p_user_id: user.id, 
            p_xp_to_add: xpToAdd 
          });
          
          if (rpcError) {
            console.error('Error updating total XP:', rpcError);
            toast({ title: "Error", description: "Failed to update your total XP.", variant: "destructive" });
          } else {
            toast({ title: "XP Gained!", description: `+${xpToAdd} XP added to your profile.` });
          }
        }
        // --- End of NEW ---
          
      } catch (err) {
        console.error('Error saving quiz completion:', err);
      }
    }

    // Show completion toast
    if (isPass) {
      // Passed the quiz
      if (connected && publicKey && !rewardedQuizzes.has(quizId)) {
        toast({
          title: "Quiz Passed! 🎉",
          description: `You scored ${score}%. Click below to claim your JIET tokens!`,
          action: (
            <Button
              size="sm"
              onClick={() => handleClaimReward(quizId, score)}
              disabled={isClaimingReward}
            >
              {isClaimingReward ? 'Claiming...' : 'Claim Reward'}
            </Button>
          ),
        });
      } else {
        toast({
          title: "Quiz Passed! 🎉",
          description: `You scored ${score}%. ${!connected ? 'Connect your wallet to claim JIET rewards!' : ''}`,
        });
      }
    } else {
      // Failed the quiz
      toast({
        title: "Quiz Complete",
        description: `You scored ${score}%. You need 70% to pass. Try again!`,
        variant: "destructive"
      });
    }
  };

  // ... (rest of the file is the same) ...
  // handleClaimReward, handleStartQuiz, totalXP calculation, etc.
  // are all correct and will work with these changes.
};

export default Quiz;